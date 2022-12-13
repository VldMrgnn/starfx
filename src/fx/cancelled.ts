import type { Task } from "../task.js";
import type { SagaGenerator, SimpleEffect } from "../types.js";
import { makeEffect } from "./util.js";

type CancelledEffect = SimpleEffect<"cancelled", CancelledEffectDescriptor>;

type CancelledEffectDescriptor = {};

export function* cancelled(): SagaGenerator<boolean, CancelledEffect> {
  // TODO: fix
  const fx = yield makeEffect("cancelled", {}) as any;
  return fx as any;
}

export function runCancelledEffect<TOut>(task: Task<TOut>) {
  task.finished({
    value: task.createdBy?.status() === "cancelled",
    state: "completed",
  });
}
