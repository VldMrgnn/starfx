import type { Effect, Labels } from "./types.js";

export interface Labelled {
  name?: string;
  labels?: Labels;
}

export interface OperationGenerator<TOut>
  extends Generator<any, TOut | undefined, any> {}

export interface OperationPromise<TOut> extends Promise<TOut>, Labelled {}

export type Operation<TOut> =
  | Effect
  | OperationGenerator<TOut>
  | OperationPromise<TOut>
  | number
  | string
  | boolean;
