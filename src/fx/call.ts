import type { Emitter } from "../emitter.js";
import { isFunc, isString } from "../predicates.js";
import type { Task } from "../task.js";
import type {
  SagaIterator,
  SagaReturnType,
  SimpleEffect,
  SagaGenerator,
} from "../types.js";
import { makeEffect } from "./util.js";

export interface CallEffectDescriptor<RT> {
  context: any;
  fn: (...args: any[]) => SagaIterator<RT> | Promise<RT> | RT;
  args: any[];
}

export type CallEffect<RT = any> = SimpleEffect<
  "call",
  CallEffectDescriptor<RT>
>;

export function call<Args extends any[], Fn extends (...args: Args) => any>(
  fn: Fn,
  ...args: Args
): SagaGenerator<SagaReturnType<Fn>, CallEffect<SagaReturnType<Fn>>>;
export function call<
  Args extends any[],
  Ctx extends {
    [P in Name]: (this: Ctx, ...args: Args) => any;
  },
  Name extends string,
>(
  ctxAndFnName: [Ctx, Name],
  ...args: Args
): SagaGenerator<
  SagaReturnType<Ctx[Name]>,
  CallEffect<SagaReturnType<Ctx[Name]>>
>;
export function call<
  Args extends any[],
  Ctx extends {
    [P in Name]: (this: Ctx, ...args: Args) => any;
  },
  Name extends string,
>(
  ctxAndFnName: { context: Ctx; fn: Name },
  ...args: Args
): SagaGenerator<
  SagaReturnType<Ctx[Name]>,
  CallEffect<SagaReturnType<Ctx[Name]>>
>;
export function call<
  Ctx,
  Args extends any[],
  Fn extends (this: Ctx, ...args: Args) => any,
>(
  ctxAndFn: [Ctx, Fn],
  ...args: Args
): SagaGenerator<SagaReturnType<Fn>, CallEffect<SagaReturnType<Fn>>>;
export function call<
  Ctx,
  Args extends any[],
  Fn extends (this: Ctx, ...args: Args) => any,
>(
  ctxAndFn: { context: Ctx; fn: Fn },
  ...args: Args
): SagaGenerator<SagaReturnType<Fn>, CallEffect<SagaReturnType<Fn>>>;
export function* call<
  Fn extends (...args: any[]) => any = (...args: any[]) => any,
>(fn: Fn, ...args: Parameters<Fn>): Generator<any, SagaReturnType<Fn>, any> {
  return yield makeEffect("call", getFnCallDescriptor(fn, args));
}

export function getFnCallDescriptor(fnDesc: any, args: any[]) {
  let context = null;
  let fn;

  if (isFunc(fnDesc)) {
    fn = fnDesc;
  } else {
    if (Array.isArray(fnDesc)) {
      [context, fn] = fnDesc;
    } else {
      context = fnDesc.context;
      fn = fnDesc.fn;
    }

    if (context && isString(fn) && isFunc(context[fn])) {
      fn = context[fn];
    }
  }

  return { context, fn, args };
}

export function runCallEffect<TOut>(
  task: Task<TOut>,
  { payload: { context, fn, args } }: CallEffect<TOut>,
  signal: Emitter,
) {
  try {
    const result = fn.apply(context, args);
    const child = task.create(result as any);
    // if the parent task finishes before child then
    // we need to propogate cancellation to child
    signal.once((r) => {
      child.cancel(r.value);
    });
    child.once((props) => {
      task.finished(props);
    });
    // since we are spawning a separate task that extends a promise
    // we need to swallow the errors that come from this task.
    //
    // we don't need to worry about this because `.once` will also receive
    // the error state.
    child.catch(() => {
      // no-op
    });
    child.start();
  } catch (err) {
    task.finished({ value: err, state: "errored" });
  }
}
