import {
  call,
  race,
  // debounce as debounceHelper,
  // throttle as throttleHelper,
} from "../fx/mod.ts";
import { take, takeLatest, takeLeading } from "../redux/mod.ts";
import { sleep, spawn, Task } from "../deps.ts";
import type { ActionWPayload } from "../types.ts";

import type { CreateActionPayload } from "./types.ts";

const MS = 1000;
const SECONDS = 1 * MS;
const MINUTES = 60 * SECONDS;

export function* latest(action: string, saga: any, ...args: any[]) {
  const task = yield* takeLatest(`${action}`, () => saga(...args));
  yield* task;
}

export function* leading(action: string, saga: any, ...args: any[]) {
  const task = yield* takeLeading(`${action}`, () => saga(...args));
  yield* task;
}

/* export function createThrottle(ms: number = 5 * SECONDS) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield throttleHelper(ms, `${action}`, saga, ...args);
  };
}

export function createDebounce(ms: number = 5 * SECONDS) {
  return function* (action: string, saga: any, ...args: any[]) {
    yield debounceHelper(ms, `${action}`, saga, ...args);
  };
} */

export function poll(parentTimer: number = 5 * 1000, cancelType?: string) {
  return function* poller(actionType: string, saga: any, ...args: any[]) {
    const cancel = cancelType || actionType;
    function* fire(action: { type: string }, timer: number) {
      while (true) {
        yield* call(() => saga(action, ...args));
        yield* sleep(timer);
      }
    }

    while (true) {
      const action = yield* take<{ timer?: number }>(`${actionType}`);
      const timer = action.payload?.timer || parentTimer;
      yield* race({
        fire: () => call(() => fire(action, timer)),
        cancel: () => take(`${cancel}`),
      });
    }
  };
}

/**
 * timer() will create a cache timer for each `key` inside
 * of a saga-query api endpoint.  `key` is a hash of the action type and payload.
 *
 * Why do we want this?  If we have an api endpoint to fetch a single app: `fetchApp({ id: 1 })`
 * if we don't set a timer per key then all calls to `fetchApp` will be on a timer.
 * So if we call `fetchApp({ id: 1 })` and then `fetchApp({ id: 2 })` if we use a normal
 * cache timer then the second call will not send an http request.
 */
export function timer(timer: number = 5 * MINUTES) {
  return function* onTimer(actionType: string, saga: any, ...args: any[]) {
    const map: { [key: string]: Task<unknown> } = {};

    function* activate(action: ActionWPayload<CreateActionPayload>) {
      yield* saga(action, ...args);
      yield* sleep(timer);
      delete map[action.payload.key];
    }

    while (true) {
      const action = yield* take<CreateActionPayload>(`${actionType}`);
      const key = action.payload.key;
      if (!map[key]) {
        const task = yield* spawn(function* () {
          yield* activate(action);
        });
        map[key] = task;
      }
    }
  };
}
