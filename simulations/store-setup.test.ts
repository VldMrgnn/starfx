import { describe, expect, install, it, mock } from "../test.ts";
import { configureStore, put, select } from "../redux/mod.ts";
import { call } from "../fx/call.ts";
import { parallel } from "../fx/parallel.ts";
import { fetcher } from "../query/fetch.ts";
import {
  dispatchActions,
  errorHandler,
  requestMonitor,
} from "../query/middleware.ts";
import { createApi } from "../query/api.ts";
import { createPipe } from "../query/pipe.ts";
import { createTable } from "../deps.ts";

import { ensureArray } from "./utils.ts";
import type { LoaderCtx, Next, PipeCtx } from "../query/types.ts";
import { ParallelRet } from "../mod.ts";
import type { Operation } from "../deps.ts";
install();

const baseUrl = "https://saga-query.com";

interface AppState {
  [key: string]: any;
}
interface Action<T extends string = string> {
  type: T;
}

interface ActionWithPayload<P> extends Action {
  payload: P;
}

interface ThunkCtx<P = any, D = any> extends PipeCtx<P>, LoaderCtx<P> {
  actions: Action[] | ActionWithPayload<P>[];
  json: D | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface MessageList {
  id: number;
  message: string;
}

const api = createApi();
api.use(requestMonitor());
api.use(api.routes());
api.use(fetcher({ baseUrl }));

const thunks = createPipe<ThunkCtx>();
thunks.use(errorHandler);
thunks.use(dispatchActions);
thunks.use(thunks.routes());

const USERS = "USERS";
const MESSAGES = "MESSAGES";
const usersRepo = createTable<User>({ name: USERS, initialState: {} });
const messagesRepo = createTable<MessageList>({
  name: MESSAGES,
  initialState: {},
});

const firstMessage = "first message";
const mockUser1 = { id: "1", name: "test1", email: "test1@test.com" };
// const mockUser2 = { id: "2", name: "test2", email: "test2@test.com" };
// const mockMessage1 = { id: 1, message: "message1" };
// const mockMessage2 = { id: 2, message: "message2" };

// const userState = (s: RootState) => s[USERS];
const messageState = (s: RootState) => s[MESSAGES];

export const fetchUsers = api.get(
  "/users",
  function* (ctx, next) {
    yield* next();
    if (ctx.json.ok) {
      const users = ctx.json.data;
      const umap = ensureArray(users).reduce(
        (acc: Record<string, User>, crt: User) => {
          acc[crt.id] = { id: crt.id, name: crt.name, email: crt.email };
          return acc;
        },
        {},
      );
      yield* put(usersRepo.actions.set(umap));
    }
  },
);

const resetState = thunks.create(
  "RESET_STATE",
  function* (_ctx: ThunkCtx, next: Next) {
    yield* put(usersRepo.actions.set({}));
    yield* put(messagesRepo.actions.set({}));
    yield* next();
  },
);
const setMessage = thunks.create<string>(
  "SET_MESSAGE",
  function* (ctx: ThunkCtx, next: Next) {
    const currentstate = yield* select(messageState);
    const nextGenId = Object.keys(currentstate).length + 1;
    const message = ctx.payload;
    yield* put(messagesRepo.actions.add({ [nextGenId]: message }));
    yield* next();
  },
);
const rootReducer = {
  [usersRepo.name]: usersRepo.reducer,
  [messagesRepo.name]: messagesRepo.reducer,
};
export const { store, fx } = configureStore({
  reducers: rootReducer,
});

// this does not run the state correctly:
export const runState_00 = () =>
  fx.run(function* () {
    fx.run(api.bootup);
    fx.run(thunks.bootup);
    yield* put(
      setMessage(firstMessage),
    );
  });

// this runs the state correctly:
export const runState_01 = () =>
  fx.run(function* () {
    fx.run(api.bootup);
    fx.run(thunks.bootup);
    yield* call(() =>
      setMessage.run(
        setMessage(
          firstMessage,
        ),
      )
    );
  });

export const runState_02 = () =>
  fx.run(function* () {
    fx.run(api.bootup);
    fx.run(thunks.bootup);
    yield* put(
      setMessage(firstMessage),
    );
  });


export const runState_03 = () =>
  fx.run(function* () {
    const engine = yield* parallel([
      api.bootup,
      thunks.bootup,
      function* () {
        yield* put(setMessage(firstMessage));
      },
    ]) as Operation<ParallelRet<unknown>>;
    yield* engine;
  });

  
export const runState_04 = () => {
  fx.run(api.bootup);
  fx.run(thunks.bootup);
  store.dispatch(setMessage(firstMessage));
};

type RootReducer = typeof rootReducer;
type RootState = ReturnType<typeof store.getState>;

const promiSleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
/* -------------------------------------------------------------------------- */

const tests = describe("store-setup");

it.ignore(tests, "should load the store correctly 00", async () => {
  runState_00();
  await promiSleep(100);
  const state = store.getState();
  const lastMessage = Object.values(state[MESSAGES]).pop();
  expect(lastMessage).toBe(firstMessage);
  await promiSleep(100);
  store.dispatch(resetState());
});

it.ignore(tests, "should load the store correctly 01", async () => {
  runState_01();
  await promiSleep(100);
  const state = store.getState();
  const lastMessage = Object.values(state[MESSAGES]).pop();
  expect(lastMessage).toBe(firstMessage);
  await promiSleep(100);
  store.dispatch(resetState());
});

it.ignore(tests, "should load the store correctly 02", async () => {
  runState_02();
  await promiSleep(100);
  const state = store.getState();
  const lastMessage = Object.values(state[MESSAGES]).pop();
  expect(lastMessage).toBe(firstMessage);
  await promiSleep(100);
  store.dispatch(resetState());
});

it(tests, "should load the store correctly 03", async () => {
  runState_03();
  await promiSleep(100);
  const state = store.getState();
  const lastMessage = Object.values(state[MESSAGES]).pop();
  expect(lastMessage).toBe(firstMessage);
  await promiSleep(100);
  store.dispatch(resetState());
});

it(tests, "can dispatch an api", async () => {
  mock(`GET@/users`, () => {
    return new Response(JSON.stringify(mockUser1));
  });
  runState_03();
  await promiSleep(100);
  await fx.run(function* () {
    yield* put(fetchUsers());
  });
  await promiSleep(100);
  const state = store.getState();
  const userCount = Object.keys(state[USERS]).length;
  expect(userCount).toBeGreaterThan(0);
  store.dispatch(resetState());
});

it.ignore(
  tests,
  "[THE BEST RESULTS] should load the store correctly 04",
  async () => {
    runState_04();
    await promiSleep(100);
    const state = store.getState();
    const lastMessage = Object.values(state[MESSAGES]).pop();
    expect(lastMessage).toBe(firstMessage);
    await promiSleep(100);
    store.dispatch(resetState());
  },
);

it.ignore(tests, "[THE BEST RESULTS] can dispatch an api", async () => {
  mock(`GET@/users`, () => {
    return new Response(JSON.stringify(mockUser1));
  });
  runState_04();
  await promiSleep(100);
  await fx.run(function* () {
    yield* put(fetchUsers());
  });
  await promiSleep(100);
  const state = store.getState();
  const userCount = Object.keys(state[USERS]).length;
  expect(userCount).toBeGreaterThan(0);
  store.dispatch(resetState());
});
