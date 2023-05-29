import type { Scope } from "../deps.ts";

export type StoreUpdater<S> = (
  s: S,
) => S | void;

export type Listener = () => void;

export interface UpdaterCtx<S> {
  updater: StoreUpdater<S>;
}

export interface FxStore<S> {
  getScope: () => Scope;
  getState: () => S;
  subscribe: (fn: Listener) => () => void;
  update: (u: StoreUpdater<S>) => void;
}

export interface ActionWPayload<P> {
  type: string;
  payload: P;
}
