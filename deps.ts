import type { Result } from "https://deno.land/x/effection@3.0.0-alpha.9/mod.ts";
export type {
  Channel,
  Instruction,
  Operation,
  Scope,
  Stream,
  Task,
} from "https://deno.land/x/effection@3.0.0-alpha.9/mod.ts";
export {
  action,
  createChannel,
  createContext,
  createScope,
  expect,
  getframe,
  resource,
  run,
  sleep,
  spawn,
  useAbortSignal,
} from "https://deno.land/x/effection@3.0.0-alpha.9/mod.ts";

export type { Result };
export function Ok<T>(value: T): Result<T> {
  return { ok: true, value };
}
export function Err<T>(error: Error): Result<T> {
  return { ok: false, error };
}

import React from "https://esm.sh/react@18.2.0?pin=v122";
export { React };
export {
  Provider,
  useDispatch,
  useSelector,
} from "https://esm.sh/react-redux@8.0.5?pin=v122";

export {
  enablePatches,
  produce,
  produceWithPatches,
} from "https://esm.sh/immer@10.0.2?pin=v122";
export type { Patch } from "https://esm.sh/immer@10.0.2?pin=v122";
