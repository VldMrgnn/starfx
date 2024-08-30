import { sleep } from '../deps.ts';
import { Ok, Operation, parallel, put, take } from '../mod.ts';
import {
    createPersistor, createSchema, createStore, createTransform, PERSIST_LOADER_ID, PersistAdapter,
    persistStoreMdw, slice
} from '../store/mod.ts';
import { asserts, describe, it } from '../test.ts';
import { LoaderItemState } from '../types.ts';

const tests = describe("store");


it(tests, "can persist to storage adapters", async () => {
  const [schema, initialState] = createSchema({
    token: slice.str(),
    loaders: slice.loaders(),
    cache: slice.table({ empty: {} }),
  });
  type State = typeof initialState;
  let ls = "{}";
  const adapter: PersistAdapter<State> = {
    getItem: function* (_: string) {
      return Ok(JSON.parse(ls));
    },
    setItem: function* (_: string, s: Partial<State>) {
      ls = JSON.stringify(s);
      return Ok(undefined);
    },
    removeItem: function* (_: string) {
      return Ok(undefined);
    },
  };
  const persistor = createPersistor<State>({ adapter, allowlist: ["token"] });
  const mdw = persistStoreMdw(persistor);
  const store = createStore({
    initialState,
    middleware: [mdw],
  });

  await store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();

    const group = yield* parallel([
      function* (): Operation<void> {
        const action = yield* take<string>("SET_TOKEN");
        yield* schema.update(schema.token.set(action.payload));
      },
      function* () {
        yield* put({ type: "SET_TOKEN", payload: "1234" });
      },
    ]);
    yield* group;
  });

  asserts.assertEquals(
    ls,
    '{"token":"1234"}',
  );
});

it(tests, "rehydrates state", async () => {
  const [schema, initialState] = createSchema({
    token: slice.str(),
    loaders: slice.loaders(),
    cache: slice.table({ empty: {} }),
  });
  type State = typeof initialState;
  let ls = JSON.stringify({ token: "123" });
  const adapter: PersistAdapter<State> = {
    getItem: function* (_: string) {
      return Ok(JSON.parse(ls));
    },
    setItem: function* (_: string, s: Partial<State>) {
      ls = JSON.stringify(s);
      return Ok(undefined);
    },
    removeItem: function* (_: string) {
      return Ok(undefined);
    },
  };
  const persistor = createPersistor<State>({ adapter, allowlist: ["token"] });
  const mdw = persistStoreMdw(persistor);
  const store = createStore({
    initialState,
    middleware: [mdw],
  });

  await store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
  });

  asserts.assertEquals(
    store.getState().token,
    "123",
  );
});

it(tests, "persists inbound state using transform 'in' function", async () => {
  const [schema, initialState] = createSchema({
    token: slice.str(),
    loaders: slice.loaders(),
    cache: slice.table({ empty: {} }),
  });
  type State = typeof initialState;
  let ls = "{}";

  const adapter: PersistAdapter<State> = {
    getItem: function* (_: string) {
      return Ok(JSON.parse(ls));
    },
    setItem: function* (_: string, s: Partial<State>) {
      ls = JSON.stringify(s);
      return Ok(undefined);
    },
    removeItem: function* (_: string) {
      return Ok(undefined);
    },
  };
  
  const transform = createTransform<State>(initialState);

  transform.in= (state: State) => {
    return { ...state, token: state.token.split("").reverse().join("") };
  };

  const persistor = createPersistor<State>({
    adapter,
    allowlist: ["token", "cache"], 
    transform
  });

  const mdw = persistStoreMdw(persistor);
  const store = createStore({
    initialState,
    middleware: [mdw],
  });

  await store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();

    const group = yield* parallel([
      function* (): Operation<void> {
        const action = yield* take<string>("SET_TOKEN");
        yield* schema.update(schema.token.set(action.payload));
      },
      function* () {
        yield* put({ type: "SET_TOKEN", payload: "1234" });
      },
    ]);
    yield* group;
  });
  asserts.assertEquals(
    ls,
    '{"token":"4321","cache":{}}', 
  );
});


it(tests, "persists inbound state using tranform setInTransformer", async () => {
  const [schema, initialState] = createSchema({
    token: slice.str(),
    loaders: slice.loaders(),
    cache: slice.table({ empty: {} }),
  });
  type State = typeof initialState;
  let ls = "{}";

  const adapter: PersistAdapter<State> = {
    getItem: function* (_: string) {
      return Ok(JSON.parse(ls));
    },
    setItem: function* (_: string, s: Partial<State>) {
      ls = JSON.stringify(s);
      return Ok(undefined);
    },
    removeItem: function* (_: string) {
      return Ok(undefined);
    },
  };
  

  function revertToken(state: State): Partial<State> {
    return { ...state, token: state.token.split("").reverse().join("") };
  }
  const transform = createTransform<State>(initialState);
  transform.setInTransformer(revertToken);


  const persistor = createPersistor<State>({
    adapter,
    allowlist: ["token", "cache"],
    transform
  });

  const mdw = persistStoreMdw(persistor);
  const store = createStore({
    initialState,
    middleware: [mdw],
  });

  await store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();

    const group = yield* parallel([
      function* (): Operation<void> {
        const action = yield* take<string>("SET_TOKEN");
        yield* schema.update(schema.token.set(action.payload));
      },
      function* () {
        yield* put({ type: "SET_TOKEN", payload: "1234" });
      },
    ]);
    yield* group;
  });
  asserts.assertEquals(
    ls,
    '{"token":"4321","cache":{}}', 
  );
});

it(tests, "persists a filtered nested part of a slice", async () => {
  const [schema, initialState] = createSchema({
    token: slice.str(),
    loaders: slice.loaders(),
    cache: slice.table({ empty: {} }),
  });
  type State = typeof initialState;
  let ls = "{}";

  const adapter: PersistAdapter<State> = {
    getItem: function* (_: string) {
      return Ok(JSON.parse(ls));
    },
    setItem: function* (_: string, s: Partial<State>) {
      ls = JSON.stringify(s);
      return Ok(undefined);
    },
    removeItem: function* (_: string) {
      return Ok(undefined);
    },
  };

 
  function pickLatestOfLoadersAandC(state: State): Partial<State> {
    const nextState = { ...state }; 
  
    if (state.loaders) {
      const maxLastRun: Record<string, number> = {}; 
      const entryWithMaxLastRun: Record<string, LoaderItemState<any>> = {}; 
  
      for (const entryKey in state.loaders) {
        const entry = state.loaders[entryKey] as LoaderItemState<any>;
        const sliceName = entryKey.split("|")[0].trim(); 
        if (sliceName.includes('A') || sliceName.includes('C')) {          
          if (!maxLastRun[sliceName] || entry.lastRun > maxLastRun[sliceName]) {
            maxLastRun[sliceName] = entry.lastRun;
            entryWithMaxLastRun[sliceName] = entry; 
          }
        }
      }
      nextState.loaders = entryWithMaxLastRun; 
    }
    return nextState;
  }
  

  const transform = createTransform<State>(initialState);
  transform.setInTransformer(pickLatestOfLoadersAandC);

  const persistor = createPersistor<State>({
    adapter,
    transform
  });

  const mdw = persistStoreMdw(persistor);
  const store = createStore({
    initialState,
    middleware: [mdw],
  });

  await store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();
    const group = yield* parallel([
      function* () {
        yield* schema.update(schema.token.set("1234"));
        yield* schema.update(schema.loaders.start({ id: "A [POST]|1234", message: "loading A-first" }));
        yield* schema.update(schema.loaders.start({ id: "B" }));
        yield* schema.update(schema.loaders.start({ id: "C" }));
        yield* sleep(300);
        yield* schema.update(schema.loaders.success({ id: "A" }));
        yield* schema.update(schema.loaders.success({ id: "B" }));
        yield* schema.update(schema.loaders.success({ id: "C" }));
        yield* schema.update(schema.loaders.start({ id: "A [POST]|5678", message: "loading A-second" }));
        yield* schema.update(schema.loaders.start({ id: "B" }));
        yield* schema.update(schema.loaders.start({ id: "C" }));
        yield* sleep(300);
        yield* schema.update(schema.loaders.success({ id: "A" }));
        yield* schema.update(schema.loaders.success({ id: "B" }));
        yield* schema.update(schema.loaders.success({ id: "C" }));
        yield* schema.update(schema.token.set("1"));
      },
    ]);
    yield* group;
  });
  asserts.assertStringIncludes(
    ls,
    '{"token":"1"', 
  );
  asserts.assertStringIncludes(
    ls,
    '"message":"loading A-second"',
  );
  asserts.assertStringIncludes(
    ls,
    '"id":"C"',
  );
   asserts.assertNotMatch(
    ls,
    /"message":"loading A-first"/,
  );
  asserts.assertNotMatch(
    ls,
    /"id":"B"/,
  );
});

// todo: implement these tests


// it(tests, "persists as it is, without any transformer", async () => {
//  prooven by the other tests
// });

it(tests, "handles the empty state correctly", async () => {});
it(tests, "handles errors gracefully", async () => {});
//it(tests, "applies the transformer before persisting state" , async () => {});

// related to allowlist (if we transform/derive using the value of a slice that is not in the allow list)
// it(tests, "the tranformers are applied to the full state, regardless of the allowlist", async () => {});



// it("the inbound transformer can be reset during runtime", async () => {
//   asserts.assertEquals(1, 1);
// });

// it("persists state using transform 'out' function", async () => {
//   asserts.assertEquals(1, 1);
// });

// it("persists outbound state using tranform setOutTransformer", async () => {
//   asserts.assertEquals(1, 1);
// });

// it("persists outbound a filtered nested part of a slice", async () => {
//   asserts.assertEquals(1, 1);
// });

// it("the outbound transformer can be reset during runtime", async () => {
//   asserts.assertEquals(1, 1);
// });
