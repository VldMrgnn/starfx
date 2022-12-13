// import type { Emitter } from "../emitter.js";
import type { Task } from "../task.js";
import type { SagaGenerator, SimpleEffect } from "../types.js";
import { symbols } from "../util.js";
import { makeEffect } from "./util.js";

export type CancelEffect = SimpleEffect<"cancel", CancelEffectDescriptor>;
export type CancelEffectDescriptor = Task | "@@fx/self_cancellation";

export function cancel(task: Task): SagaGenerator<void, CancelEffect>;
export function cancel(tasks: Task[]): SagaGenerator<void, CancelEffect>;
export function cancel(): SagaGenerator<void, CancelEffect>;
export function* cancel(
  task: Task | Task[] | string = symbols.selfCancellation,
): SagaGenerator<void, CancelEffect> {
  // TODO: fix
  const result = yield makeEffect("cancel", task) as any;
  return result as any;
}

export function runCancelEffect<TOut>(
  task: Task<TOut>,
  op: CancelEffect,
  // signal: Emitter
) {
  if (Array.isArray(op.payload)) {
    op.payload.forEach((t) => t.cancel(`[${task.id}] cancel effect called`));
  } else if (typeof op.payload === "string") {
    task.createdBy?.cancel(op.payload as any);
  } else if (op.payload.status() === "running") {
    op.payload.cancel(`[${task.id}] cancel effect called`);
  }

  task.finished({ value: undefined, state: "completed" });
}
