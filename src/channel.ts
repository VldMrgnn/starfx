import { createScheduler } from "./scheduler.js";
import type { Scheduler } from "./scheduler.js";
import type { Action, Callback, PatternFn } from "./types.js";
import { once, remove, noop, symbols } from "./util.js";
import { isEnd } from "./predicates.js";

type Listener = (action: Action) => void;

export interface Channel {
  put: (action: Action) => void;
  take: (cb: Callback, pattern: PatternFn) => () => void;
  close: () => void;
  flush: () => void;
  subscribe(cb: (action: Action) => void): () => void;
  scheduler: Scheduler;
}

export function multicastChannel(): Channel {
  let closed = false;
  let current: Callback[] = [];
  let next = current;
  const scheduler = createScheduler();
  const listeners: Listener[] = [];

  const checkForbiddenStates = () => {
    if (closed && next.length) {
      throw new Error("Cannot have a closed channel with pending takers");
    }
  };

  const ensureCanMutateNextTakers = () => {
    if (next !== current) {
      return;
    }
    next = current.slice();
  };

  const close = () => {
    if (process.env["NODE_ENV"] !== "production") {
      checkForbiddenStates();
    }

    closed = true;
    current = next;
    const takers = next;
    next = [];
    takers.forEach((taker) => {
      taker({ type: symbols.end });
    });
  };

  const put = (action: Action) => {
    if (process.env["NODE_ENV"] !== "production") {
      checkForbiddenStates();
    }

    if (closed) {
      return;
    }

    if (isEnd(action)) {
      close();
      return;
    }

    current = next;
    next.forEach((taker) => {
      if (!taker) {
        return;
      }
      if (!taker["@@fx/match"]) {
        return;
      }
      if (!taker["@@fx/match"](action)) {
        return;
      }

      if (taker.cancel) {
        taker.cancel();
      }
      taker(action);
    });

    listeners.forEach((listener) => {
      listener(action);
    });
  };

  const take = (cb: Callback, pattern: PatternFn) => {
    if (process.env["NODE_ENV"] !== "production") {
      checkForbiddenStates();
    }

    if (closed) {
      cb({ type: symbols.end });
      return noop;
    }

    cb["@@fx/match"] = pattern;
    ensureCanMutateNextTakers();
    next.push(cb);

    return once(() => {
      ensureCanMutateNextTakers();
      remove(next, cb);
    });
  };

  const flush = noop;
  const subscribe = (cb: (action: Action) => void) => {
    listeners.push(cb);
    return () => remove(listeners, cb);
  };

  return {
    close,
    put,
    take,
    flush,
    subscribe,
    scheduler,
  };
}

export function stdChannel() {
  const chan = multicastChannel();
  const { put } = chan;
  chan.put = (input: Action) => {
    if (input["@@fx/action"]) {
      put(input);
      return;
    }
    chan.scheduler.asap(() => {
      put(input);
    });
  };
  return chan;
}
