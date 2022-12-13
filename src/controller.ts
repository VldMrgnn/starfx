import { createEmitter } from "./emitter.js";
import { runCallEffect } from "./fx/call.js";
import {
  deferred,
  runAllEffect,
  runCancelEffect,
  runCancelledEffect,
  runForkEffect,
  runPutEffect,
  runRaceEffect,
  runTakeEffect,
  symbols,
} from "./index.js";
import type {
  Operation,
  OperationGenerator,
  OperationPromise,
} from "./operation.js";
import { isEffect, isFunc, isIterator, isPromise } from "./predicates.js";
import type { Task } from "./task.js";
import type { Effect, NextProps } from "./types.js";

export interface Controller<TOut> {
  type: string;
  operation: Operation<TOut>;
  task: Task<TOut>;
  start(): void;
  cancel(reason: string): void;
}

function createIteratorController<TOut>(
  task: Task<TOut>,
  iterator: OperationGenerator<TOut>,
): Controller<TOut> {
  let didCancel = false;
  let nextTask: Task | null = null;

  function start() {
    // kick the generator
    next({ value: undefined, state: "running" });
  }

  function cancel(reason: string) {
    if (didCancel) {
      return;
    }
    didCancel = true;
    if (nextTask) {
      nextTask.cancel(reason);
    } else {
      next({ value: reason, state: "cancelled" });
    }
  }

  function next({ value, state }: NextProps) {
    try {
      let result: IteratorResult<any, any> = { value: undefined, done: false };
      const shouldCancel = state === "cancelled" || value === symbols.cancel;
      const shouldAbort = state === "aborted" || value === symbols.terminate;
      const shouldThrow = state === "errored";

      if (shouldThrow) {
        result = iterator.throw(value);
      } else if (shouldCancel) {
        result = iterator.return(symbols.cancel as any);
      } else if (shouldAbort) {
        result = iterator.return(undefined);
      } else {
        // the magic
        result = iterator.next(value);
      }

      if (result.done) {
        if (didCancel) {
          task.finished({ value: symbols.cancel, state: "cancelled" });
        } else {
          task.finished({ value: result.value, state: "completed" });
        }
        return;
      }

      // each "operation" gets its own task so we can control it via
      // task methods
      nextTask = task.create(result.value);
      // since we are spawning a separate task that extends a promise
      // we need to swallow the errors that come from this task.
      //
      // we don't need to worry about this because `.once` will also receive
      // the error state.
      nextTask.catch(() => {
        // no-op
      });
      // This is how we propagate the result of the child task
      // to the parent task
      nextTask.once((p) => {
        // we need to mark the parent task as cancelled immediately
        // for self-cancellation to work properly
        if (p.state === "cancelled") {
          task.cancel(p.value);
        }
        // children tasks should not send aborted signal to parent
        // instead we notify the parent that the child errored
        if (p.state === "aborted") {
          next({ value: p.value, state: "errored" });
        } else {
          next(p);
        }
      });
      nextTask.start();
    } catch (err) {
      if (task.status() === "cancelled") {
        throw err;
      }
      // when there's an error that isn't caught then we should bubble
      // the error up to the task promise and reject it
      task.finished({ value: err, state: "aborted" });
    }
  }

  return {
    type: "iterator",
    operation: iterator,
    task,
    start,
    cancel,
  };
}

function createPromiseController<TOut>(
  task: Task<TOut>,
  promise: OperationPromise<TOut>,
): Controller<TOut> {
  const def = deferred();
  let cancelled = false;
  return {
    type: "promise",
    operation: promise,
    task,
    start: () => {
      Promise.race([def, promise])
        .then((value) => {
          task.finished({ value, state: "completed" });
        })
        .catch((err: Error) => {
          if (cancelled) {
            task.finished({ value: err, state: "cancelled" });
          } else {
            task.finished({ value: err, state: "errored" });
          }
        });
    },
    cancel: (reason: string) => {
      cancelled = true;
      def.reject(reason);
    },
  };
}

function createEffectController<TOut>(
  task: Task<TOut>,
  effect: Effect,
): Controller<TOut> {
  const signal = createEmitter();
  return {
    type: "effect",
    operation: effect,
    task,
    start: () => {
      switch (effect.type) {
        case "call":
          return runCallEffect(task, effect as any, signal);
        case "put":
          return runPutEffect(task, effect as any);
        case "fork":
          return runForkEffect(task, effect as any, signal);
        case "take":
          return runTakeEffect(task, effect as any, signal);
        case "race":
          return runRaceEffect(task, effect as any, signal);
        case "all":
          return runAllEffect(task, effect as any, signal);
        case "cancel":
          return runCancelEffect(task, effect as any);
        case "cancelled":
          return runCancelledEffect(task);
        default:
          console.error(`${effect.type} not supported`);
      }
    },
    cancel: (reason: string) => {
      signal.emit({ value: reason, state: "cancelled" });
    },
  };
}

function createValueController<TOut>(
  task: Task<TOut>,
  operation: any,
): Controller<TOut> {
  return {
    type: "value",
    operation,
    task,
    start: () => {
      task.finished({ value: operation, state: "completed" });
    },
    cancel: (value: string) => {
      task.cancel(`[${task.id}] was cancelled by controller`);
      task.finished({ value, state: "cancelled" });
    },
  };
}

export function createController<TOut>(
  task: Task<TOut>,
  operation: Operation<TOut>,
): Controller<TOut> {
  if (isFunc(operation)) {
    const iter = (operation as any)();
    return createIteratorController(task, iter);
  } else if (isIterator(operation)) {
    return createIteratorController(task, operation as any);
  } else if (isPromise(operation)) {
    return createPromiseController(task, operation as any);
  } else if (isEffect(operation)) {
    return createEffectController(task, operation as any);
  }

  // return the operation as the value
  return createValueController(task, operation);
}
