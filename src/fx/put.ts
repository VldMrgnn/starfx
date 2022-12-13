import type { Task } from "../task.js";
import type { Action, SimpleEffect, SagaGenerator, END } from "../types.js";
import { makeEffect } from "./util.js";

interface PutEffectDescriptor<A extends Action> {
  action: A;
  channel: null;
}

type PutEffect<A extends Action = Action> = SimpleEffect<
  "put",
  PutEffectDescriptor<A>
>;
type ChannelPutEffect<T> = SimpleEffect<"put", ChannelPutEffectDescriptor<T>>;

interface ChannelPutEffectDescriptor<T> {
  action: T;
  channel: PuttableChannel<T>;
}

interface PuttableChannel<T> {
  put(message: T | END): void;
}

/**
 * Creates an Effect description that instructs the middleware to put an action
 * into the provided channel.
 *
 * This effect is blocking if the put is *not* buffered but immediately consumed
 * by takers. If an error is thrown in any of these takers it will bubble back
 * into the saga.
 */
export function put<A extends Action>(
  action: A,
): SagaGenerator<A, PutEffect<A>>;
export function put<T>(
  channel: PuttableChannel<T>,
  action: T | END,
): SagaGenerator<T, ChannelPutEffect<T>>;
export function* put(chan: any, act?: any): any {
  let channel = chan;
  let action = act;
  if (channel?.type) {
    action = channel;
    channel = undefined;
  }

  return yield makeEffect("put", { channel, action });
}

// TODO fix operation
export function runPutEffect<TOut>(task: Task<TOut>, operation: PutEffect) {
  /**
   Schedule the put in case another saga is holding a lock.
   The put will be executed atomically. ie nested puts will execute after
   this put has terminated.
   **/
  task.channel.scheduler.asap(() => {
    try {
      task.channel.put(operation.payload.action);
    } catch (error) {
      task.finished({ value: error, state: "errored" });
      return;
    }

    task.finished({ value: null, state: "completed" });
  });
  // Put effects are non cancellables
}
