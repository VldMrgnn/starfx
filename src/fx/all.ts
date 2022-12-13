import type { Emitter } from "../emitter.js";
import type { Task } from "../task.js";
import type {
  ActionPattern,
  CombinatorEffect,
  NextProps,
  SagaGenerator,
} from "../types.js";
import { createEmptyArray, shouldComplete } from "../util.js";
import type { CallEffectDescriptor, CallEffect } from "./call.js";
import type { TakeEffect } from "./take.js";
import { makeEffect } from "./util.js";

type AllEffect<T> = CombinatorEffect<"all", T>;

type EffectReturnType<T> = T extends SagaGenerator<infer RT, any>
  ? RT
  : T extends CallEffect
  ? T["payload"] extends CallEffectDescriptor<infer RT>
    ? RT
    : never
  : T extends TakeEffect
  ? ActionPattern
  : unknown;

export function all<T>(
  effects: T[],
): SagaGenerator<EffectReturnType<T>[], AllEffect<T>>;
export function all<T extends { [key: string]: any }>(
  effects: T,
): SagaGenerator<
  {
    [K in keyof T]: EffectReturnType<T[K]>;
  },
  AllEffect<T[keyof T]>
>;
export function* all(effects: any): any {
  const eff = makeEffect("all", effects);
  eff.combinator = true;
  return yield eff;
}

// TODO: fix types
export function runAllEffect<TOut>(
  task: Task<TOut>,
  operation: AllEffect<TOut>,
  signal: Emitter,
) {
  const effects = operation.payload;
  if (!Array.isArray(effects)) {
    return;
  }
  if (effects.length === 0) {
    task.finished({
      value: [],
      state: "completed",
    });
    return;
  }
  let completed = false;
  let completedCount = 0;
  const totalCount = effects.length;

  const siblings: Set<Task> = new Set();
  const results: any[] = createEmptyArray(totalCount);

  const cancel = (props: NextProps) => {
    let cancelled = 0;
    siblings.forEach((sib) => {
      sib.once(() => {
        cancelled += 1;
        if (cancelled !== siblings.size) {
          return;
        }
        task.finished(props);
      });

      sib.cancel(props.value);
    });
  };

  // if the parent task finishes before child then
  // we need to propogate cancellation to child
  signal.once((props) => {
    cancel(props);
  });

  effects.forEach((fx, key) => {
    if (!fx) {
      return;
    }
    const child = task.create(fx as any);
    siblings.add(child);

    child.catch(() => {
      // no-op
    });

    child.once((props) => {
      if (completed) {
        return;
      }

      results[key] = props.value;
      completedCount += 1;

      if (
        props.state === "errored" ||
        props.state === "aborted" ||
        shouldComplete(props.value)
      ) {
        completed = true;
        cancel(props);
        return;
      }

      if (completedCount === totalCount) {
        completed = true;
        task.finished({ value: results, state: "completed" });
      }
      siblings.delete(child);
    });

    child.start();
  });
}
