import { describe, expect, it } from "../test.ts";
import { configureStore, put } from "../redux/mod.ts";
import { createReducerMap, createTable } from "../deps.ts";

import { sleep, spawn } from "../deps.ts";
import { call } from "../fx/call.ts";

import { createPipe } from "../query/pipe.ts";
import {
  dispatchActions,
  errorHandler,
  requestMonitor,
} from "../query/middleware.ts";

import type {
  ActionWithPayload,
  LoaderCtx,
  Next,
  PipeCtx,
} from "../query/types.ts";
import type { OpFn } from "../types.ts";
import type { AnyAction, Operation, Result } from "../deps.ts";

export interface Action<T extends string = string> {
  type: T;
}

export interface ThunkCtx<P = any, D = any> extends PipeCtx<P>, LoaderCtx<P> {
  actions: Action[] | ActionWithPayload<P>[];
  json: D | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  eventInit: number;
  eventPut: string | number;
}

const tests = describe("double-put");
const USER_BY_ID = "USER/byId";
const USER_BY_PUT_ID = "USER/byPutId";
const usersById = createTable<User>({ name: USER_BY_ID, initialState: {} });
const usersByPutId = createTable<User>({
  name: USER_BY_PUT_ID,
  initialState: {},
});

const reducers = createReducerMap(usersById, usersByPutId);
const mockUser1 = {
  id: "1",
  name: "test1",
  email: "test1@test.com",
  eventInit: -1,
  eventPut: -1,
};
const mockUser2 = {
  id: "2",
  name: "test2",
  email: "test2@test.com",
  eventInit: -1,
  eventPut: -1,
};

export const thunks = createPipe<ThunkCtx>();
thunks.use(errorHandler);
thunks.use(dispatchActions);
thunks.use(thunks.routes());

function setupStore(op: OpFn) {
  const { store, fx } = configureStore({ reducers });
  return { store, run: () => fx.run(op), fx };
}

let passCount = 0;
const ensureArray = <T>(x: T | T[]): T[] =>
  Array.isArray(x) ? x : [x].filter((el) => el !== undefined);
const createUserByIdMap = (users: User[]) =>
  users.reduce(
    (acc, user) => ({
      ...acc,
      [user.id]: { ...user, eventPut: performance.now() },
    }),
    {},
  );
const createUserByPutIdMap = (users: User[]) =>
  users.reduce((acc: Record<User["eventPut"], User>, user: User) => {
    passCount++;
    const putID = `${performance.now() * 10000}`;
    acc[putID] = { ...user, eventPut: putID };
    return acc;
  }, {});

const resetState = thunks.create(
  "reset_state",
  function* (_ctx: ThunkCtx, next: Next) {
    yield* put(usersById.actions.reset());
    yield* put(usersByPutId.actions.reset());
    yield* next();
  },
);
const setUserThunk = thunks.create<User | User[]>(
  "thunk/setUserInBothMaps",
  function* (ctx: ThunkCtx, next: Next) {
    const user = ensureArray(ctx.payload);
    yield* put(usersById.actions.add(createUserByIdMap(user)));
    yield* put(usersByPutId.actions.add(createUserByPutIdMap(user)));
    yield* next();
  },
);
const callerThunkWithCall = thunks.create<User | User[]>(
  "thunk/caller/call",
  function* (ctx: ThunkCtx, next: Next) {
    yield* call(() => setUserThunk.run(setUserThunk(ctx.payload)));

    yield* next();
  },
);

const callerThunkWithPUt = thunks.create<User | User[]>(
  "thunk/caller/put",
  function* (ctx: ThunkCtx, next: Next) {
    yield* put(setUserThunk(ctx.payload));
    yield* next();
  },
);

const { store, fx } = setupStore(thunks.bootup);
const runReset = () =>
  fx.run(function* (): Operation<void> {
    yield* call(() => resetState.run(resetState()));
  });

const runSetUser = (user: User) =>
  fx.run(function* (): Operation<void> {
    yield* call(() => setUserThunk.run(setUserThunk(user)));
  });

const runPutCaller = (user: User) =>
  fx.run(function* (): Operation<void> {
    yield* call(() => callerThunkWithPUt.run(callerThunkWithPUt(user)));
  });

const runCallCaller = (user: User) =>
  fx.run(function* (): Operation<void> {
    yield* call(() => callerThunkWithCall.run(callerThunkWithCall(user)));
  });

it(tests, "call()... should set the same user once per table", async () => {
  await runReset();
  const thisInitID = performance.now();
  const thisMockUser1 = { ...mockUser1, eventInit: thisInitID };
  await runSetUser(thisMockUser1);
  const state = store.getState();
  const userByIdCount = Object.keys(state[USER_BY_ID]).length;
  const userByPutIdCount = Object.keys(state[USER_BY_PUT_ID]).length;
  expect(passCount).toEqual(1);
  expect(userByIdCount).toEqual(1);
  expect(userByIdCount).toEqual(userByPutIdCount);
});

it(tests, "it is impossible to PUT from one thunk to another", async () => {
  await runReset();
  const thisInitID = performance.now();
  const thisMockUser1 = { ...mockUser1, eventInit: thisInitID };
  await runPutCaller(thisMockUser1);
  const state = store.getState();
  const userByIdCount = Object.keys(state[USER_BY_ID]).length;
  expect(userByIdCount).toEqual(0);
});

it(tests, "it is possible to CALL from one thunk to another", async () => {
  await runReset();
  const thisInitID = performance.now();
  const thisMockUser1 = { ...mockUser1, eventInit: thisInitID };
  await runCallCaller(thisMockUser1);
  const state = store.getState();
  const userByIdCount = Object.keys(state[USER_BY_ID]).length;
  expect(userByIdCount).toEqual(1);
  await runReset();
});
