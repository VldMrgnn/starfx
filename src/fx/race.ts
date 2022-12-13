import type { Emitter } from "../emitter.js";
import type { Task } from "../task.js";
import type {
  ActionPattern,
  CombinatorEffect,
  Effect,
  SagaGenerator,
} from "../types.js";
import type { CallEffect, CallEffectDescriptor } from "./call.js";
import type { TakeEffect } from "./take.js";
import { makeEffect } from "./util.js";

type RaceEffect<T> = CombinatorEffect<"race", T>;

type EffectReturnType<T> = T extends SagaGenerator<infer RT, any>
  ? RT
  : T extends CallEffect
  ? T["payload"] extends CallEffectDescriptor<infer RT>
    ? RT
    : never
  : T extends TakeEffect
  ? ActionPattern
  : unknown;

export function race<T extends { [key: string]: any }>(
  effects: T,
): SagaGenerator<
  {
    [K in keyof T]: EffectReturnType<T[K]> | undefined;
  },
  RaceEffect<T[keyof T]>
>;

export function* race(effects: { [key: string]: Effect }): any {
  const eff = makeEffect("race", effects);
  eff.combinator = true;
  return yield eff;
}

export function runRaceEffect<TOut>(
  task: Task<TOut>,
  operation: RaceEffect<TOut>,
  signal: Emitter,
) {
  const keys = Object.keys(operation.payload);
  const siblings: Set<Task> = new Set();
  const results: { [key: string]: string } = {};
  let completed = false;

  keys.forEach((key) => {
    if (completed) {
      return;
    }

    const fx = (operation.payload as any)[key];
    if (!fx) {
      return;
    }

    const child = task.create(fx as any);
    siblings.add(child);

    // if the parent task finishes before child then
    // we need to propogate cancellation to child
    signal.once((props) => {
      completed = true;
      child.cancel(props.value);
    });

    child.catch(() => {
      // no-op
    });

    child.once((props) => {
      if (completed) {
        return;
      }

      results[key as any] = props.value;
      completed = true;

      siblings.forEach((sib) => {
        if (sib === child) {
          return;
        }

        if (props.state === "aborted") {
          sib.abort(`parent task [${task.id}] was aborted`);
        } else {
          sib.cancel(`parent task [${task.id}] was cancelled`);
        }
      });

      task.finished({ value: Object.values(results), state: "completed" });
    });

    child.start();
  });
}
