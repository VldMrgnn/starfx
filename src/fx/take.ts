import type { Emitter } from "../emitter.js";
import {
  isChannel,
  isEnd,
  isMulticast,
  isNotUndef,
  isPattern,
} from "../predicates.js";
import type { Task } from "../task.js";
import type {
  Action,
  ActionPattern,
  Pattern,
  SagaGenerator,
  END,
  SimpleEffect,
} from "../types.js";
import { symbols } from "../util.js";
import { makeEffect, matcher } from "./util.js";

interface TakeEffectDescriptor {
  pattern: ActionPattern;
}

export type TakeEffect = SimpleEffect<"take", TakeEffectDescriptor>;

type ChannelTakeEffect<T> = SimpleEffect<
  "take",
  ChannelTakeEffectDescriptor<T>
>;

interface ChannelTakeEffectDescriptor<T> {
  channel: TakeableChannel<T>;
  pattern?: Pattern<T>;
  maybe?: boolean;
}

interface TakeableChannel<T> {
  take(cb: (message: T | END) => void): void;
}

export function take<A extends Action>(
  pattern: ActionPattern<A>,
): SagaGenerator<A, TakeEffect>;
export function take<T>(
  channel: TakeableChannel<T>,
  multicastPattern?: Pattern<T>,
): SagaGenerator<T, ChannelTakeEffect<T>>;
export function* take(
  patternOrChannel: any,
  multicastPattern?: any,
): SagaGenerator<any, any> {
  if (isPattern(patternOrChannel)) {
    if (isNotUndef(multicastPattern)) {
      console.warn(
        "take(pattern) takes one argument but two were provided. Consider passing an array for listening to several action types",
      );
    }

    return yield makeEffect("take", { pattern: patternOrChannel });
  }

  if (
    isMulticast(patternOrChannel) &&
    isNotUndef(multicastPattern) &&
    isPattern(multicastPattern)
  ) {
    return yield makeEffect("take", {
      channel: patternOrChannel,
      pattern: multicastPattern,
    });
  }

  if (isChannel(patternOrChannel)) {
    if (isNotUndef(multicastPattern)) {
      console.warn(
        "take(channel) takes one argument but two were provided. Second argument is ignored.",
      );
    }

    return yield makeEffect("take", { channel: patternOrChannel });
  }

  return null;
}

// TODO fix operation
export function runTakeEffect<TOut>(
  task: Task<TOut>,
  operation: TakeEffect,
  signal: Emitter,
) {
  const takeCb = (input: any) => {
    if (input instanceof Error) {
      task.finished({ value: input, state: "errored" });
      return;
    }

    if (isEnd(input)) {
      task.finished({ value: symbols.terminate, state: "completed" });
      return;
    }

    task.finished({ value: input, state: "completed" });
  };

  try {
    const match = isNotUndef(operation.payload.pattern)
      ? matcher(operation.payload.pattern)
      : null;
    const cancel = task.channel.take(takeCb, match);
    // parent task signal
    signal.once((props) => {
      cancel();
      task.finished(props);
    });
  } catch (err) {
    task.finished({ value: err, state: "errored" });
    return;
  }
}
