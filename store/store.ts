import { Action, createScope, produce, Result, Scope, Task } from "../deps.ts";
import { BaseMiddleware, compose } from "../compose.ts";
import { contextualize } from "../context.ts";
import type { OpFn } from "../types.ts";
import { call } from "../fx/mod.ts";

import type {
  AnyState,
  FxStore,
  Listener,
  StoreUpdater,
  UpdaterCtx,
} from "./types.ts";
import { StoreUpdateContext } from "./context.ts";
import { put } from "./fx.ts";

const stubMsg = "This is merely a stub, not implemented";

// https://github.com/reduxjs/redux/blob/4a6d2fb227ba119d3498a43fab8f53fe008be64c/src/createStore.ts#L344
function observable() {
  return {
    subscribe: (_observer: unknown) => {
      throw new Error(stubMsg);
    },
    [Symbol.observable]() {
      return this;
    },
  };
}

export interface CreateStore<S extends AnyState> {
  scope?: Scope;
  initialState: S;
  middleware?: BaseMiddleware[];
}

export function createStore<S extends AnyState>({
  initialState,
  scope = createScope(),
  middleware = [],
}: CreateStore<S>): FxStore<S> {
  let state = initialState;
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

  function createUpdater() {
    const fn = compose<UpdaterCtx<S>>([
      ...middleware,
      function* (ctx, next) {
        let nextState: S;
        if (Array.isArray(ctx.updater)) {
          nextState = produce(getState(), (draft) => {
            const upds = ctx.updater as StoreUpdater<S>[];
            // TODO: check for return value inside updater
            upds.forEach((updater) => updater(draft as any));
          });
        } else {
          nextState = produce(getState(), ctx.updater);
        }
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

  const mdw = createUpdater();
  function* update(updater: StoreUpdater<S> | StoreUpdater<S>[]) {
    const ctx = {
      updater,
    };
    return yield* mdw(ctx);
  }

  function dispatch(action: Action | Action[]) {
    return scope.run(function* () {
      yield* put(action);
    });
  }

  function run<T>(op: OpFn<T>): Task<Result<T>> {
    return scope.run(function* () {
      return yield* call(op);
    });
  }

  return {
    getScope,
    getState,
    subscribe,
    update,
    run,
    // instead of actions relating to store mutation, they
    // refer to pieces of business logic -- that can also mutate state
    dispatch,
    // stubs so `react-redux` is happy
    replaceReducer<S = any>(_nextReducer: (_s: S, _a: Action) => void): void {
      throw new Error(stubMsg);
    },
    [Symbol.observable]: observable,
  };
}

export function register<S>(store: FxStore<S>) {
  const scope = store.getScope();
  return scope.run(function* () {
    yield* contextualize("store", store);
  });
}

const defaultScope = createScope();
export async function configureStore<S extends AnyState>({
  scope = defaultScope,
  ...props
}: CreateStore<S>): Promise<FxStore<S>> {
  const store = createStore<S>({ scope, ...props });
  await register(store);
  return store;
}
