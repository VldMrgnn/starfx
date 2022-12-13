import type { Operation } from "../operation.js";
import { isIterator, isPromise } from "../predicates.js";
import type { Task } from "../task.js";
import type { SagaGenerator, SagaReturnType, SimpleEffect } from "../types.js";
import { makeEffect } from "./util.js";
import type { CallEffectDescriptor } from "./call.js";
import { getFnCallDescriptor } from "./call.js";
import type { Emitter } from "../emitter.js";

const kThrow = (err: any) => {
  throw err;
};
const kReturn = (value: any) => ({ value, done: true });
function makeIterator(
  next: (arg: any) => { value: any; done: boolean },
  thro = kThrow,
  name = "iterator",
) {
  const iterator = {
    meta: { name },
    next,
    throw: thro,
    return: kReturn,
    isSagaIterator: true,
  };

  if (typeof Symbol !== "undefined") {
    (iterator as any)[Symbol.iterator] = () => iterator;
  }
  return iterator;
}

// TODO fix types
function createTaskIterator({ payload: { context, fn, args } }: ForkEffect) {
  // catch synchronous failures; see #152 and #441
  try {
    const result = fn.apply(context, args);

    // i.e. a generator function returns an iterator
    if (isIterator(result)) {
      return result;
    }

    let resolved = false;

    const next = (arg: any) => {
      if (resolved) {
        return { value: arg, done: true };
      } else {
        resolved = true;
        // Only promises returned from fork will be interpreted. See #1573
        return { value: result, done: !isPromise(result) };
      }
    };

    return makeIterator(next);
  } catch (err) {
    // do not bubble up synchronous failures for detached forks
    // instead create a failed task. See #152 and #441
    return makeIterator(() => {
      throw err;
    });
  }
}

export function runForkEffect<TOut>(
  task: Task<TOut>,
  operation: ForkEffect<TOut>,
  signal: Emitter,
) {
  const taskIterator = createTaskIterator(operation);

  task.channel.scheduler.immediately(() => {
    const child = task.create(taskIterator as Operation<TOut>);
    child.start();

    if (operation.payload.detached) {
      task.finished({ value: child, state: "completed" });
    } else {
      // if the parent task finishes before child then
      // we need to propogate cancellation to child
      signal.once((props) => {
        child.cancel(props.value);
      });

      if (child.status() === "running") {
        // the task created for the fork() effect is short-lived
        // we actually want to attach the child task to the parent
        // of the short-lived task.
        //
        // This is kind of annoying.
        if (task.createdBy) {
          task.createdBy.link(child);
        }
        task.finished({ value: child, state: "completed" });
      } else if (child.status() === "aborted") {
        task.abort(`[${child}] aborted`);
      } else {
        task.finished({ value: child, state: "completed" });
      }
    }

    return child;
  });
}

interface FixedTask<A> extends Task {
  result: <T = A>() => T | undefined;
}

export type ForkEffect<RT = any> = SimpleEffect<
  "fork",
  ForkEffectDescriptor<RT>
>;

export interface ForkEffectDescriptor<RT> extends CallEffectDescriptor<RT> {
  detached?: boolean;
}

export function* fork<
  Fn extends (...args: any[]) => any = (...args: any[]) => any,
>(
  fn: Fn,
  ...args: Parameters<Fn>
): SagaGenerator<
  FixedTask<SagaReturnType<Fn>>,
  ForkEffect<SagaReturnType<Fn>>
> {
  // TODO: fix
  const fx: any = yield makeEffect(
    "fork",
    getFnCallDescriptor(fn, args),
  ) as any;
  return fx;
}
