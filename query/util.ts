import type { ApiRequest, RequiredApiRequest } from "./types.ts";

export function* noop() {}
// deno-lint-ignore no-explicit-any
export const isFn = (fn?: any) => fn && typeof fn === "function";
// deno-lint-ignore no-explicit-any
export const isObject = (obj?: any) => typeof obj === "object" && obj !== null;

export const mergeHeaders = (
  cur?: HeadersInit,
  next?: HeadersInit,
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
    headers: mergeHeaders(cur?.headers, next?.headers),
  };
};

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
