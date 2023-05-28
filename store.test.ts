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

import { createScope, getframe, produce, Scope, z } from "./deps.ts";
import { asserts, describe, it } from "./test.ts";
import { contextualize } from "./context.ts";

const tests = describe("store");

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

/**
 * IMPLEMENTATION
 */

type StoreUpdater = (
  s: State,
) => State | void;

type Listener = () => void;

export function register<S>(store: FxStore<S>) {
  const scope = store.getScope();
  return scope.run(function* () {
    yield* contextualize("store", store);
  });
}

interface FxStore<S> {
  getScope: () => Scope;
  getState: () => S;
  subscribe: (fn: Listener) => () => void;
  update: (u: StoreUpdater) => void;
}

export function createStore<S>(
  { scope, initialState = {} }: {
    scope: Scope;
    initialState: Partial<S>;
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

  function update(updater: StoreUpdater) {
    try {
      const nextState = produce(getState(), updater);
      state = nextState;
      listeners.forEach((fn) => fn());
    } catch (err) {
      console.error(err);
    }
  }

  return {
    getScope,
    getState,
    subscribe,
    update,
  };
}

function* updateStore(updater: StoreUpdater) {
  const frame = yield* getframe();
  const store = frame.context["store"] as FxStore<State>;
  store.update(updater);
}

/**
 * USER-LAND
 */

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
