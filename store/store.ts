import { produce, Scope } from "../deps.ts";
import { BaseMiddleware, compose } from "../compose.ts";
import type { FxStore, Listener, StoreUpdater, UpdaterCtx } from "./types.ts";
import { StoreUpdateContext } from "./context.ts";

export function createStore<S>(
  { scope, initialState = {}, middleware = [] }: {
    scope: Scope;
    initialState?: Partial<S>;
    middleware?: BaseMiddleware[];
  },
): FxStore<S> {
  let state = initialState as S;
  const listeners = new Set<Listener>();

  function getScope() {
    return scope;
  }

  function getState() {
    return state;
  }

  function subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function createUpdater<S>() {
    const fn = compose<UpdaterCtx<S>>([
      ...middleware,
      function* (ctx, next) {
        const nextState = produce(getState(), ctx.updater);
        state = nextState;
        yield* next();
      },
      function* (_, next) {
        const chan = yield* StoreUpdateContext;
        yield* chan.input.send();
        yield* next();
      },
      function* (_, next) {
        listeners.forEach((f) => f());
        yield* next();
      },
    ]);

    return fn;
  }

  const mdw = createUpdater<S>();
  function* update(updater: StoreUpdater<S>) {
    const ctx = {
      updater,
    };
    return yield* mdw(ctx);
  }

  return {
    getScope,
    getState,
    subscribe,
    update,
  };
}
