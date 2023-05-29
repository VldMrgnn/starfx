import { AnyAction, Channel, Operation, spawn, Task } from "../deps.ts";
import { contextualize } from "../context.ts";
import { call, cancel, emit } from "../fx/mod.ts";
import { ActionPattern, matcher } from "../redux/matcher.ts";
import type { ActionWPayload, FxStore, StoreUpdater } from "./types.ts";
import { ActionContext, StoreContext } from "./context.ts";

export function register<S>(store: FxStore<S>) {
  const scope = store.getScope();
  return scope.run(function* () {
    yield* contextualize("store", store);
  });
}

export function* updateStore<S>(updater: StoreUpdater<S>) {
  const store = yield* StoreContext;
  store.update(updater as any);
}

export function* once({
  channel,
  pattern,
}: {
  channel: Operation<Channel<AnyAction, void>>;
  pattern: ActionPattern;
}) {
  const { output } = yield* channel;
  const msgList = yield* output;
  let next = yield* msgList;
  while (!next.done) {
    const match = matcher(pattern);
    if (match(next.value)) {
      return next.value;
    }
    next = yield* msgList;
  }
}

export function* select<S, R, P>(selectorFn: (s: S, p?: P) => R, p?: P) {
  const store = yield* StoreContext;
  return selectorFn(store.getState() as S, p);
}

export function* put(action: AnyAction | AnyAction[]) {
  return yield* emit({
    channel: ActionContext,
    action,
  });
}

export function take<P>(pattern: ActionPattern): Operation<ActionWPayload<P>>;
export function* take(pattern: ActionPattern): Operation<AnyAction> {
  const action = yield* once({
    channel: ActionContext,
    pattern,
  });
  return action as AnyAction;
}

export function* takeEvery<T>(
  pattern: ActionPattern,
  op: (action: AnyAction) => Operation<T>,
): Operation<Task<void>> {
  return yield* spawn(function* () {
    while (true) {
      const action = yield* take(pattern);
      if (!action) continue;
      yield* spawn(() => op(action));
    }
  });
}

export function* takeLatest<T>(
  pattern: ActionPattern,
  op: (action: AnyAction) => Operation<T>,
): Operation<Task<void>> {
  return yield* spawn(function* () {
    let lastTask;
    while (true) {
      const action = yield* take(pattern);
      if (lastTask) {
        yield* cancel(lastTask);
      }
      if (!action) continue;
      lastTask = yield* spawn(() => op(action));
    }
  });
}

export function* takeLeading<T>(
  pattern: ActionPattern,
  op: (action: AnyAction) => Operation<T>,
): Operation<Task<void>> {
  return yield* spawn(function* () {
    while (true) {
      const action = yield* take(pattern);
      if (!action) continue;
      yield* call(() => op(action));
    }
  });
}
