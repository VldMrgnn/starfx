import {
  BATCH,
  Channel,
  Instruction,
  Operation,
  Scope,
  Subscription,
} from "../deps.ts";
import type { Action, ActionWPayload, OpFn, StoreLike } from "../types.ts";
import { ActionPattern, matcher } from "../matcher.ts";

import {
  configureStore,
  createChannel,
  createContext,
  createScope,
  spawn,
} from "../deps.ts";
import { contextualize } from "../context.ts";
import { call, cancel, emit, parallel } from "../fx/mod.ts";

export const ActionContext = createContext<Channel<Action, void>>(
  "redux:action",
  createChannel<Action, void>(),
);
export const TakeContext = createContext<Subscription<Action, void>>(
  "redux:action:take",
);
export const StoreContext = createContext<StoreLike>("redux:store");

export function* select<S, R>(selectorFn: (s: S) => R) {
  const store = yield* StoreContext;
  return selectorFn(store.getState() as S);
}

// https://github.com/microsoft/TypeScript/issues/31751#issuecomment-498526919
export function take<P>(
  pattern: ActionPattern,
): Generator<
  Instruction,
  ActionWPayload<P>,
  unknown
>;
export function* take(pattern: ActionPattern) {
  console.log('PATT', pattern);
  const subscription = yield* TakeContext;
  let next = yield* subscription;
  while (!next.done) {
    console.log(next.value, pattern);
    const match = matcher(pattern);
    if (match(next.value)) {
      return next.value;
    }
    next = yield* subscription;
  }
}

export function* takeEvery<T>(
  pattern: ActionPattern,
  op: (action: Action) => Operation<T>,
) {
  return yield* spawn(function* () {
    while (true) {
      const action = yield* take(pattern);
      if (!action) continue;
      console.log(action);
      yield* spawn(() => op(action));
    }
  });
}

export function* takeLatest<T>(
  pattern: ActionPattern,
  op: (action: Action) => Operation<T>,
) {
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
  op: (action: Action) => Operation<T>,
) {
  return yield* spawn(function* () {
    let active = false;

    while (true) {
      const action = yield* take(pattern);
      if (!action) continue;
      if (active) continue;

      try {
        active = true;
        yield* call(() => op(action));
      } finally {
        active = false;
      }
    }
  });
}

export function* put(action: Action | Action[]) {
  const store = yield* StoreContext;
  if (Array.isArray(action)) {
    action.map((act) => store.dispatch(act));
  } else {
    store.dispatch(action);
  }
  yield* emit({
    channel: ActionContext,
    action,
  });
}

function* send(action: Action) {
  if (action.type === BATCH) {
    const actions: Action[] = action.payload;
    yield* parallel(
      actions.map(
        (a) =>
          function* () {
            yield* emit({
              channel: ActionContext,
              action: a,
            });
          },
      ),
    );
  } else {
    yield* emit({
      channel: ActionContext,
      action,
    });
  }
}

export function* reduxContext<S>(store: StoreLike<S>) {
  yield* contextualize("redux:store", store);
  const actionChannel = yield* ActionContext;
  const { output } = actionChannel;
  const subscription = yield* output;
  yield* contextualize("redux:action:take", subscription);
}

export function createFxMiddleware(scope: Scope = createScope()) {
  function run<T>(op: OpFn<T>) {
    const task = scope.run(function* runner() {
      return yield* call(op);
    });

    return task;
  }

  function middleware<S = unknown, T = unknown>(store: StoreLike<S>) {
    scope.run(function* () {
      yield* reduxContext(store);
    });

    return (next: (a: Action) => T) => (action: Action) => {
      const result = next(action); // hit reducers
      scope.run(function* () {
        yield* send(action);
      });
      return result;
    };
  }

  return { run, scope, middleware };
}

interface SetupStoreProps<S = any> {
  reducer: (s: S, _: Action) => S;
}

export function setupStore({ reducer }: SetupStoreProps) {
  const fx = createFxMiddleware();
  const store = configureStore({
    reducer,
    middleware: [fx.middleware],
  });

  return { store, fx };
}
