import type { Middleware, Reducer, Result, Task } from "../deps.ts";
import { combineReducers, enableBatching } from "../deps.ts";

import type { QueryState } from "./slice.ts";
import { reducers as sagaQueryReducers } from "./slice.ts";
import { OpFn } from "../types.ts";
import { createFxMiddleware } from "../redux/mod.ts";
import { keepAlive } from "../mod.ts";

export interface PrepareStore<
  S extends { [key: string]: any } = { [key: string]: any },
> {
  reducer: Reducer<S & QueryState>;
  middleware: Middleware<any, S, any>[];
  run: (...args: any[]) => Task<Result<unknown>>;
}

interface Props<S extends { [key: string]: any } = { [key: string]: any }> {
  reducers: { [key in keyof S]: Reducer<S[key]> };
  fx: { [key: string]: OpFn };
}

/**
 * This will setup `redux-batched-actions` to work with `redux-saga`.
 * It will also add some reducers to your `redux` store for decoupled loaders
 * and a simple data cache.
 *
 * @example
 * ```ts
 * import { prepareStore } from 'saga-query';
 * import { configureStore } from '@reduxjs/toolkit';
 *
 * const { middleware, reducer, run } = prepareStore({
 *  reducers: { users: (state, action) => state },
 *  fx: { api: api.saga() },
 * });
 *
 * const store = configureStore({
 *  reducer,
 *  middleware,
 * });
 *
 * // you must call `.run(...args: any[])` in order for the sagas to bootup.
 * run();
 * ```
 */
export function prepareStore<
  S extends { [key: string]: any } = { [key: string]: any },
>({ reducers = {} as any, fx }: Props<S>): PrepareStore<S> {
  const middleware: Middleware<any, S, any>[] = [];

  const fxMiddleware = createFxMiddleware();
  middleware.push(fxMiddleware.middleware);

  const reducer = combineReducers({ ...sagaQueryReducers, ...reducers });
  const rootReducer: any = enableBatching(reducer);
  const run = () => fxMiddleware.run(() => keepAlive(Object.values(fx)));

  return {
    middleware,
    reducer: (s, a) => {
      // console.log(s, a);
      return rootReducer(s, a);
    },
    run,
  };
}
