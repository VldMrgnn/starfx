/**
 * IDEA
 * ====
 *
 * The core idea here is rebuild redux without reducers and instead
 * leverage something like `zod` to construct the state shape and then `immer`
 * to ensure immutability.
 *
 * Features:
 *  - Single "god object" (ala `redux`)
 *  - Primary way to update state is by dispatching actions (ala `redux`)
 *  - Update state object just like any other JS object (via `immer`)
 *  - Instead of reducers we just allow user to provide `updater`
 *    plain functions that receive `immer` drafts
 *  - Ensure integration compatibility with `react-redux`
 *
 * Notes:
 *  - subscribing to updates could be interesting within the context of `effection`, we
 *    should experiment what it would look like to listen for updates to state
 */

import {
  AnyAction,
  Channel,
  createChannel,
  createContext,
  createScope,
  Operation,
  produce,
  Scope,
  spawn,
  Task,
  z,
} from "./deps.ts";
import { asserts, describe, it } from "./test.ts";
import { contextualize } from "./context.ts";
import { call, cancel, emit } from "./fx/mod.ts";
import { ActionPattern, matcher } from "./redux/matcher.ts";
import { BaseMiddleware, compose } from "./compose.ts";

const tests = describe("store");

/**
 * IMPLEMENTATION
 */
export const ActionContext = createContext<Channel<AnyAction, void>>(
  "action",
  createChannel<AnyAction, void>(),
);

export const StoreUpdateContext = createContext<Channel<void, void>>(
  "action",
  createChannel<void, void>(),
);

export const StoreContext = createContext<FxStore<unknown>>("store");

interface ActionWPayload<P> {
  type: string;
  payload: P;
}

type StoreUpdater<S> = (
  s: S,
) => S | void;

type Listener = () => void;

export function register<S>(store: FxStore<S>) {
  const scope = store.getScope();
  return scope.run(function* () {
    yield* contextualize("store", store);
  });
}

interface UpdaterCtx<S> { updater: StoreUpdater<S> }

export interface FxStore<S> {
  getScope: () => Scope;
  getState: () => S;
  subscribe: (fn: Listener) => () => void;
  update: (u: StoreUpdater<S>) => void;
}

export function createStore<S>(
  { scope, initialState = {}, middleware = [] }: {
    scope: Scope;
    initialState: Partial<S>;
    middleware: BaseMiddleware[];
  },
): FxStore<S> {
  let state = initialState as S;
  const listeners = new Set<Listener>();

  function getScope() {
    return scope;
  }

  function getState() {
    return state;
  }

  function subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function createUpdater<S>() {
    const fn = compose<UpdaterCtx<S>>([
      ...middleware,
      function* (ctx, next) {
        const nextState = produce(getState(), ctx.updater);
        state = nextState;
        yield* next();
      },
      function* (_, next) {
        const chan = yield* StoreUpdateContext;
        yield* chan.input.send();
        yield* next();
      },
      function* (_, next) {
        listeners.forEach((f) => f());
        yield* next();
      },
    ]);

    return fn;
  }

  const mdw = createUpdater<S>();
  function update(updater: StoreUpdater<S>) {
    const ctx = {
      updater,
    };
    return mdw(ctx);
  }

  return {
    getScope,
    getState,
    subscribe,
    update,
  };
}

function* updateStore<S>(updater: StoreUpdater<S>) {
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

/**
 * USER-LAND
 */

/**
 * BUILD THE SCHEMA
 */
const User = z.object({
  id: z.string(),
  name: z.string(),
}).default({ id: "", name: "" });

const Token = z
  .object({
    accessToken: z.string(),
  })
  .nullable();

const Schema = z.object({
  users: z.record(User).default({}), // table(User, { pk: "id" }),
  currentUser: User.default({ id: "", name: "" }).nullable(),
  theme: z.string().default(""),
  token: Token.default(null),
  dev: z.boolean().default(true),
});

type State = z.infer<typeof Schema>;

/**
 * SELECTORS
 */

function findUserById(state: State, { id }: { id: string }) {
  return state.users[id];
}

function findUsers(state: State) {
  return state.users;
}

const updateUser =
  ({ id, name }: { id: string; name: string }) => (state: State) => {
    // use selectors to find the data you want to mutate
    const user = findUserById(state, { id });
    user.name = name;

    // different ways to update a `zod` record
    const users = findUsers(state);
    users[id].name = name;

    delete users[2];
    users[3] = User.parse(undefined);

    // or mutate state directly without selectors
    state.dev = true;
  };

it(tests, "should do something", async () => {
  const scope = createScope();
  const initialState: Partial<State> = Schema.parse({
    users: { 1: { id: "1", name: "testing" }, 2: { id: "2", name: "wow" } },
    dev: false,
  });
  const store = createStore({ scope, initialState });

  scope.run(function* () {
    while (true) {
      const action = yield* take("*");
      console.log(action);
    }
  });

  scope.run(function* () {
    const store = yield* StoreContext;
    yield* store.updated();
    console.log(store.getState());
  });

  await register(store);

  store.subscribe(() => {
    asserts.assertEquals(store.getState(), {
      users: { 1: { id: "1", name: "eric" }, 3: { id: "", name: "" } },
      currentUser: User.parse(undefined),
      theme: "",
      token: null,
      dev: true,
    });
  });

  await scope.run(function* () {
    yield* updateStore(updateUser({ id: "1", name: "eric" }));
  });
});
