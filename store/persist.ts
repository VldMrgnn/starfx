import { call, Callable, Err, Ok, Operation, Result, sleep } from '../deps.ts';
import { select, updateStore } from './fx.ts';

import type { AnyState, Next } from "../types.ts";
import type { UpdaterCtx } from "./types.ts";

export const PERSIST_LOADER_ID = "@@starfx/persist";

export interface PersistAdapter<S extends AnyState> {
  getItem(key: string): Operation<Result<Partial<S>>>;
  setItem(key: string, item: Partial<S>): Operation<Result<unknown>>;
  removeItem(key: string): Operation<Result<unknown>>;
}

export interface PersistProps<S extends AnyState> {
  adapter: PersistAdapter<S>;
  allowlist: (keyof S)[];
  key: string;
  reconciler: (original: S, rehydrated: Partial<S>) => S;
  rehydrate: () => Operation<Result<unknown>>;
  transform?: TransformFunctions<S>;
}

interface TransformFunctions<S extends AnyState> {
  in(s:Partial<S>): Operation<Partial<S>>;
  out(s: Partial<S>):Operation<Partial<S>>;
}

export function createTransform<S extends AnyState>(initialState: Partial<S>) {
  const state = initialState;

  const transformers: TransformFunctions<S> = {
    in: function* (_: Partial<S>): Operation<Partial<S>> {
      return state;

    },
    out: function* (_: Partial<S>): Operation<Partial<S>> {
      return state;
    }
  };
  const setInTransformer = function (transformer: (fn: Partial<S>) => Operation<Partial<S>>): void {
    transformers.in = transformer;
  };
  const setOutTransformer = function(transformer: (fn: Partial<S>) => Operation<Partial<S>>): void {
    transformers.out = transformer;
  };

  const inTransformer = function* (state: Partial<S>): Operation<Partial<S>> {
    const result =  yield* transformers.in(state);
    return result;
  };

  const outTransformer = function* (state: Partial<S>): Operation<Partial<S>> {
    const result =  yield* transformers.out(state);
    return result;
  };

  return {
    in: inTransformer,
    out: outTransformer,
    setInTransformer,
    setOutTransformer,
  };
}
export function createLocalStorageAdapter<S extends AnyState>(): PersistAdapter<
  S
> {
  return {
    getItem: function* (key: string) {
      const storage = localStorage.getItem(key) || "{}";
      return Ok(JSON.parse(storage));
    },
    setItem: function* (key: string, s: Partial<S>) {
      const state = JSON.stringify(s);
      try {
        localStorage.setItem(key, state);
      } catch (err: any) {
        return Err(err);
      }
      return Ok(undefined);
    },
    removeItem: function* (key: string) {
      localStorage.removeItem(key);
      return Ok(undefined);
    },
  };
}

export function shallowReconciler<S extends AnyState>(
  original: S,
  persisted: Partial<S>,
): S {
  return { ...original, ...persisted };
}

export function createPersistor<S extends AnyState>(
  { adapter, key = "starfx", reconciler = shallowReconciler, allowlist = [], transform }:
    & Pick<PersistProps<S>, "adapter">
    & Partial<PersistProps<S>>,
): PersistProps<S> {
  function* rehydrate(): Operation<Result<undefined>> {
    const persistedState = yield* adapter.getItem(key);
    if (!persistedState.ok) {
      return Err(persistedState.error);
    }
    let stateFromStorage = persistedState.value as Partial<S>;

    if (transform) {
      stateFromStorage = yield* call(()=> transform.out(stateFromStorage));
    }

    const state = yield* select((s) => s);
    const nextState = reconciler(state as S, stateFromStorage);
    yield* updateStore<S>(function (state) {
      Object.keys(nextState).forEach((key: keyof S) => {
        state[key] = nextState[key];
      });
    });

    return Ok(undefined);
  }

  return {
    key,
    adapter,
    allowlist,
    reconciler,
    rehydrate,
    transform
  };
}

export function persistStoreMdw<S extends AnyState>(
  { allowlist, adapter, key, transform }: PersistProps<S>,
) {
  return function* (_: UpdaterCtx<S>, next: Next) {
    yield* next();
    const state = yield* select((s: S) => s);

    let transformedState: Partial<S> = state;
    if (transform) {
      transformedState =yield* call(transform.in(state));
    }

    // empty allowlist list means save entire state
    if (allowlist.length === 0) {
      yield* adapter.setItem(key, transformedState);
      return;
    }

    const allowedState = allowlist.reduce<Partial<S>>((acc, key) => {
      if (key in transformedState) {
        acc[key] = transformedState[key] as S[keyof S];
      }
      return acc;
    }, {});

    yield* adapter.setItem(key, allowedState);
  };
}