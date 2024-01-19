import type { Instruction, Operation } from "./deps.ts";

export interface Computation<T = unknown> {
  // deno-lint-ignore no-explicit-any
  [Symbol.iterator](): Iterator<Instruction, T, any>;
}

export type Next = () => Operation<void>;

export type IdProp = string | number;
export type LoadingStatus = "loading" | "success" | "error" | "idle";
export interface LoaderItemState<
  M extends Record<string, unknown> = Record<IdProp, unknown>,
> {
  id: string;
  status: LoadingStatus;
  message: string;
  lastRun: number;
  lastSuccess: number;
  meta: M;
}

export interface LoaderState<
  M extends AnyState = AnyState,
> extends LoaderItemState<M> {
  isIdle: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isInitialLoading: boolean;
}

export type LoaderPayload<M extends AnyState> =
  & Pick<LoaderItemState<M>, "id">
  & Partial<Pick<LoaderItemState<M>, "message" | "meta">>;

// deno-lint-ignore no-explicit-any
export type AnyState = Record<string, any>;

// deno-lint-ignore no-explicit-any
export interface Payload<P = any> {
  payload: P;
}

export interface AnyAction {
  type: string;
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

export interface Action {
  type: string;
}

export interface ActionWithPayload<P> extends Action {
  payload: P;
}
