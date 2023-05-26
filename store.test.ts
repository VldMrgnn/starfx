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
  run,
  z,
  produce,
  Middleware,
  configureStore as reduxStore,
  enableBatching,
} from "./deps.ts";
import { ActionWPayload, createFxMiddleware, put } from "./redux/mod.ts";
import { describe, it } from "./test.ts";

const tests = describe("store");

/**
 * BUILDER THE SCHEMA
 */
const User = z.object({
  id: z.string(),
  name: z.string(),
});

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

type StoreUpdater<P = never> = (
  s: State,
  p: P extends never ? undefined : P
) => State | void;

interface StoreAction<P = never> {
  type: string;
  updater: StoreUpdater<P>;
  payload: P extends never ? undefined : P;
}

/*
function* createStore<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  initState?: State
) {
  yield* contextualize("schema", schema);
  yield* contextualize("store", initState || schema.parse(undefined));
}

function* dispatch<P>(action: StoreAction<P>) {
  const frame = yield* getframe();
  const store = frame.context["store"] as State;
  const nextState = produce(store, (draft) =>
    action.updater(draft, action.payload)
  );
  yield* contextualize("store", nextState);
}
*/

function createAction<P = never>(type: string, updater: StoreUpdater<P>) {
  return (payload?: P): StoreAction<P> => ({
    type,
    updater,
    payload,
  });
}

interface SetupStoreProps {
  schema: z.ZodObject<z.ZodRawShape>;
  middleware?: Middleware[];
  initialState?: Partial<State>;
}

function starfxReducer(s: State, a: ActionWPayload<StoreAction>) {
  if (a.type === "STATE_UPDATE") {
    return produce(s, (draft) => a.payload.updater(draft, a.payload.payload));
  }

  return s;
}

export function configureStore({
  schema,
  initialState,
  middleware = [],
}: SetupStoreProps) {
  const fx = createFxMiddleware();
  const initState = initialState || schema.parse(undefined);

  const store = reduxStore({
    preloadedState: initState,
    reducer: enableBatching(starfxReducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([fx.middleware, ...middleware]),
  });

  return { store, fx };
}

/**
 * USER-LAND
 */

const updateUser = createAction(
  "UPDATE_USER",
  (state: State, { id, name }: { id: string; name: string }) => {
    // use selectors to find the data you want to mutate
    const user = findUserById(state, { id });
    user.name = name;

    // different ways to update a `zod` record
    const users = findUsers(state);
    users[id].name = name;

    delete users[2];
    users[id] = User.parse(undefined);

    // or mutate state directly without selectors
    state.dev = true;
  }
);

it(tests, "should do something", async () => {
  const store = configureStore({ schema: Schema });
  await run(function* () {
    yield* put(updateUser({ id: "1", name: "eric" }));
  });
});
