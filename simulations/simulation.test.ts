import { describe, expect, it } from "../test.ts";
import { configureStore, put } from "../redux/mod.ts";
import { createReducerMap, createTable } from "../deps.ts";

import { sleep, spawn } from "../deps.ts";
import { call } from "../fx/call.ts";

import { createPipe } from "../query/pipe.ts";
import { dispatchActions, errorHandler } from "../query/middleware.ts";

import type {
  ActionWithPayload,
  LoaderCtx,
  Next,
  PipeCtx,
} from "../query/types.ts";
import type { OpFn } from "../types.ts";
import type { Operation, Result } from "../deps.ts";

export interface ThunkCtx<P = any, D = any> extends PipeCtx<P>, LoaderCtx<P> {
  actions: ActionWithPayload<P>[];
  json: D | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const tests = describe("agregate");

const users = createTable<User>({ name: "USER" });
const reducers = createReducerMap(users);
const mockUser1 = { id: "1", name: "test1", email: "test1@test.com" };
const mockUser2 = { id: "2", name: "test2", email: "test2@test.com" };

const thunks = createPipe<ThunkCtx>();
thunks.use(errorHandler);
thunks.use(dispatchActions);
thunks.use(thunks.routes());

function setupStore(op: OpFn) {
  const { store, fx } = configureStore({ reducers });
  return { store, run: () => fx.run(op), fx };
}

const { store, fx } = setupStore(thunks.bootup);

const resetState = thunks.create(
  "reset_state",
  function* (_ctx: ThunkCtx, next: Next) {
    yield* put(users.actions.set({}));
    yield* next();
  },
);

const setUserThunk = thunks.create<User>(
  "set_one_user",
  function* (ctx: ThunkCtx, next: Next) {
    const user = ctx.payload;
    yield* put(users.actions.set(user));
    yield* next();
  },
);

const runReset = () =>
  fx.run(function* (): Operation<void> {
    yield* call(() => resetState.run(resetState()));
  });

it(tests, "can CALL > RUN a thunk from fx", async () => {
  await runReset();
  await fx.run(function* (): Operation<Result<ThunkCtx>> {
    const op = yield* call(() => setUserThunk.run(setUserThunk(mockUser1)));
    return op;
  });
  const state = store.getState();
  expect(state.USER).toEqual(mockUser1);
});

it(
  tests,
  " cannot PUT directly from thunks to other thunks (CANNOT)",
  async () => {
    const frontendThunk0 = thunks.create<User>(
      "frontend0",
      function* (ctx: ThunkCtx, next: Next) {
        const user = ctx.payload;
        // this one is not fireing the set user thunk
        yield* put(setUserThunk(user));
        yield* next();
      },
    );

    await runReset();
    await fx.run(function* (): Operation<Result<ThunkCtx>> {
      const op = yield* call(() =>
        frontendThunk0.run(frontendThunk0(mockUser2))
      );
      return op;
    });
    const state = store.getState();
    expect(state.USER).toEqual({});
  },
);

it(
  tests,
  " cannot SPAWN > PUT  from thunks to other thunks (CANNOT)",
  async () => {
    const frontendThunk1 = thunks.create<User>(
      "frontend1",
      function* (ctx: ThunkCtx, next: Next) {
        const user = ctx.payload;
        yield* spawn(function* () {
          yield* put(setUserThunk(user));
        });
        yield* next();
      },
    );

    await runReset();
    await fx.run(function* (): Operation<Result<ThunkCtx>> {
      const op = yield* call(() =>
        frontendThunk1.run(frontendThunk1(mockUser2))
      );
      return op;
    });
    const state = store.getState();
    expect(state.USER).toEqual({});
  },
);

it(
  tests,
  "cannot CALL > PUT from thunks to other thunks (CANNOT)",
  async () => {
    const frontendThunk2 = thunks.create<User>(
      "frontend2",
      function* (ctx: ThunkCtx, next: Next) {
        const user = ctx.payload;
        yield* call(function* () {
          yield* put(setUserThunk(user));
        });
        yield* next();
      },
    );

    await runReset();
    await fx.run(function* (): Operation<Result<ThunkCtx>> {
      const op = yield* call(() =>
        frontendThunk2.run(frontendThunk2(mockUser2))
      );
      return op;
    });
    const state = store.getState();
    expect(state.USER).toEqual({});
  },
);

it(tests, "can CALL > RUN SAGA from thunks to other thunks", async () => {
  const frontendThunk3 = thunks.create<User>(
    "frontend3",
    function* (ctx: ThunkCtx, next: Next) {
      const user = ctx.payload;
      yield* call(() => setUserThunk.run(setUserThunk(user)));
      yield* next();
    },
  );

  await runReset();
  await fx.run(function* (): Operation<Result<ThunkCtx>> {
    const op = yield* call(() => frontendThunk3.run(frontendThunk3(mockUser2)));
    return op;
  });
  const state = store.getState();
  expect(state.USER).toEqual(mockUser2);
});

it(tests, "can SPAWN > RUN SAGA from thunks to other thunks", async () => {
  const frontendThunk4 = thunks.create<User>(
    "frontend4",
    function* (ctx: ThunkCtx, next: Next) {
      const user = ctx.payload;
      yield* spawn(function* () {
        yield* setUserThunk.run(setUserThunk(user));
      });
      yield* next();
    },
  );

  await runReset();
  await fx.run(function* (): Operation<Result<ThunkCtx>> {
    const op = yield* call(() => frontendThunk4.run(frontendThunk4(mockUser1)));
    return op;
  });
  const state = store.getState();
  expect(state.USER).toEqual(mockUser1);
});

/*

this one is tricky because the parent should outlive the child
please see: "can FX.SPAWN > SAGA.RUN a  EFFECTION.paused thunk [?]"
from next test
So even if this pass in the real world you will never know if the child
will outlive the parent or not. So this is not a good practice.

 */
it(tests, "can FX.CALL > SAGA.RUN  a paused thunk [!]", async () => {
  const frontendThunk5 = thunks.create<User>(
    "frontend5",
    function* (ctx: ThunkCtx, next: Next) {
      const user = ctx.payload;
      yield* sleep(100);
      yield* spawn(function* () {
        yield* setUserThunk.run(setUserThunk(user));
      });
      yield* next();
    },
  );
  await runReset();
  await fx.run(function* (): Operation<Result<ThunkCtx>> {
    const op = yield* call(() => frontendThunk5.run(frontendThunk5(mockUser2)));
    return op;
  });
  const state = store.getState();
  expect(state.USER).toEqual(mockUser2);
});

it(tests, "can FX.SPAWN > SAGA.RUN a  EFFECTION.paused thunk [?]", async () => {
  const frontendThunk6 = thunks.create<User>(
    "frontend6",
    function* (ctx: ThunkCtx, next: Next) {
      const user = ctx.payload;
      yield* sleep(100);
      yield* spawn(function* () {
        yield* setUserThunk.run(setUserThunk(user));
      });
      yield* next();
    },
  );
  await runReset();
  await fx.run(function* (): Operation<void> {
    //the parent should outlive the child otherwise the child will be cancelled
    yield* spawn(function* () {
      yield* frontendThunk6.run(frontendThunk6(mockUser1));
    });
    yield* sleep(300);
  });
  const state = store.getState();
  expect(state.USER).toEqual(mockUser1);
});
