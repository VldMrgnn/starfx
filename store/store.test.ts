import { createScope, z } from "../deps.ts";
import { parallel } from "../fx/mod.ts";
import { asserts, describe, it } from "../test.ts";

import { StoreContext, StoreUpdateContext } from "./context.ts";
import { put, register, take, updateStore } from "./fx.ts";
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

interface UpdateUserProps {
  id: string;
  name: string;
}

const updateUser = ({ id, name }: UpdateUserProps) => (state: State) => {
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

it(
  tests,
  "update store and receives update from channel `StoreUpdateContext`",
  async () => {
    const scope = createScope();
    const initialState: Partial<State> = Schema.parse({
      users: { 1: { id: "1", name: "testing" }, 2: { id: "2", name: "wow" } },
      dev: false,
    });
    const store = createStore({ scope, initialState });
    await register(store);

    await scope.run(function* (): any {
      const result = yield* parallel([
        function* () {
          const store = yield* StoreContext;
          const chan = yield* StoreUpdateContext;
          const msgList = yield* chan.output;
          yield* msgList;
          asserts.assertEquals(store.getState(), {
            users: { 1: { id: "1", name: "eric" }, 3: { id: "", name: "" } },
            currentUser: User.parse(undefined),
            theme: "",
            token: null,
            dev: true,
          });
        },

        function* () {
          yield* updateStore(updateUser({ id: "1", name: "eric" }));
        },
      ]);

      return yield* result;
    });
  },
);

it(tests, "update store and receives update from `subscribe()`", async () => {
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

it(tests, "emit Action and update store", async () => {
  const scope = createScope();
  const initialState: Partial<State> = Schema.parse({
    users: { 1: { id: "1", name: "testing" }, 2: { id: "2", name: "wow" } },
    dev: false,
  });
  const store = createStore({ scope, initialState });
  await register(store);

  await scope.run(function* (): any {
    const result = yield* parallel([
      function* (): any {
        const action = yield* take<UpdateUserProps>("UPDATE_USER");
        yield* updateStore(updateUser(action.payload));
      },
      function* () {
        yield* put({ type: "UPDATE_USER", payload: { id: "1", name: "eric" } });
      },
    ]);
    yield* result;
  });

  asserts.assertEquals(store.getState(), {
    users: { 1: { id: "1", name: "eric" }, 3: { id: "", name: "" } },
    currentUser: User.parse(undefined),
    theme: "",
    token: null,
    dev: true,
  });
});

/*

function* () {
  console.log("1");
  const action = yield* take("*");
  console.log(action);
},
*/
