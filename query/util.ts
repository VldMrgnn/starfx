import { configureStore } from "../deps.ts";
import type { Reducer } from "../deps.ts";
import { prepareStore } from "./store.ts";

import { API_ACTION_PREFIX } from "./constant.ts";
import { ApiRequest, RequiredApiRequest } from "./types.ts";
import { OpFn } from "../types.ts";

export const noop = () => {};
export const isFn = (fn?: any) => fn && typeof fn === "function";
export const isObject = (obj?: any) => typeof obj === "object" && obj !== null;
export const createAction = (curType: string) => {
  if (!curType) throw new Error("createAction requires non-empty string");
  const type = `${API_ACTION_PREFIX}/${curType}`;
  const action = () => ({ type });
  action.toString = () => type;
  return action;
};

export function setupStore(
  reducers: { [key: string]: Reducer } = {},
  fx: { [key: string]: OpFn },
) {
  const fxx: any = typeof fx === "function" ? { fx } : fx;
  const prepared = prepareStore({
    reducers,
    fx: fxx,
  });
  const store: any = configureStore({
    reducer: prepared.reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...prepared.middleware),
  });
  return { store, run: prepared.run };
}

export const mergeHeaders = (
  cur?: { [key: string]: string },
  next?: { [key: string]: string },
): HeadersInit => {
  if (!cur && !next) return {};
  if (!cur && next) return next;
  if (cur && !next) return cur;
  return { ...cur, ...next };
};

export const mergeRequest = (
  cur?: ApiRequest | null,
  next?: ApiRequest | null,
): RequiredApiRequest => {
  const defaultReq = { url: "", method: "GET", headers: mergeHeaders() };
  if (!cur && !next) return { ...defaultReq, headers: mergeHeaders() };
  if (!cur && next) return { ...defaultReq, ...next };
  if (cur && !next) return { ...defaultReq, ...cur };
  return {
    ...defaultReq,
    ...cur,
    ...next,
    headers: mergeHeaders((cur as any).headers, (next as any).headers),
  };
};

export const sleep = (n: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
