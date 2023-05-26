import type { AnyAction, Operation, Result, Scope, Task } from "../deps.ts";
import type { OpFn } from "../types.ts";

export type StoreUpdater<S> = (s: S) => S | void;

export type Listener = () => void;

export interface UpdaterCtx<S> {
  updater: StoreUpdater<S> | StoreUpdater<S>[];
}

export interface ActionWPayload<P> {
  type: string;
  payload: P;
}

export type AnyState = Record<string, any>;

export interface FxStore<S> {
  getScope: () => Scope;
  getState: () => S;
  subscribe: (fn: Listener) => () => void;
  update: (u: StoreUpdater<S>) => Operation<UpdaterCtx<S>>;
  run: <T>(op: OpFn<T>) => Task<Result<T>>;
  dispatch: (a: AnyAction) => any;
  replaceReducer: (r: (s: S, a: AnyAction) => S) => void;
  [Symbol.observable]: () => any;
}
