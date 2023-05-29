import { createScope, z } from "../deps.ts";
import { asserts, describe, it } from "../test.ts";

import { StoreContext } from "./context.ts";
import { register, take, updateStore } from "./fx.ts";
import { createStore } from "./store.ts";

const tests = describe("store");

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
