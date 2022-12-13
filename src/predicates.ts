import type { Action } from "./types.js";
import { symbols } from "./util.js";

export const isEnd = (a?: Action) => a && a.type === symbols.end;
export const isFunc = (f: any) => typeof f === "function";
export const isPromise = (p: any) => p && isFunc(p.then);
export const isIterator = (it: any) =>
  it && isFunc(it.next) && isFunc(it.throw);
export const isEffect = (e: any) => e?.["@@fx/io"];
export const isString = (s: any) => typeof s === "string";
export const isNotUndef = (v: any) => v !== null && v !== undefined;
export const isSymbol = (sym: any) =>
  Boolean(sym) &&
  typeof Symbol === "function" &&
  sym.constructor === Symbol &&
  sym !== Symbol.prototype;
export const isPattern = (pat: any): boolean =>
  pat &&
  (isString(pat) ||
    isSymbol(pat) ||
    isFunc(pat) ||
    (Array.isArray(pat) && pat.every(isPattern)));
export const isChannel = (ch: any) => ch && isFunc(ch.take) && isFunc(ch.close);
export const isMulticast = (ch: any) => isChannel(ch) && ch["@@fx/multicast"];
export const isStringableFunc = (f: any) =>
  isFunc(f) && f.hasOwnProperty("toString");
