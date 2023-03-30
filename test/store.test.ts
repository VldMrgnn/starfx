import { describe, expect, it } from "../test.ts";
import { createScope } from "../deps.ts";
import { Action, OpFn, StoreLike } from "../types.ts";
import { call } from "../fx/mod.ts";
import { contextualize } from "../context.ts";
import { put } from "../redux.ts";

const tests = describe("store");

interface MapEntity<E> {
  [key: string]: E | undefined;
}

interface User {
  id: string;
  email: string;
}

interface AnyState {
  [key: string]: any;
}

type Reducer<S, A> = (s: S, a: A) => S;

type StateSchema<State extends AnyState = AnyState> = {
  [K in keyof State]: Reducer<State[K], Action>;
};

function createStore<State extends AnyState = AnyState>(
  state: StateSchema<State>
) {
  const scope = createScope();
  function run<T>(op: OpFn<T>) {
    const task = scope.run(function* runner() {
      yield* call(op);
    });

    return task;
  }

  function middleware<S = unknown, T = unknown>(store: StoreLike<S>) {
    scope.run(function* () {
      yield* contextualize("store", store);
    });

    return (next: (a: Action) => T) => (action: Action) => {
      const result = next(action); // hit reducers
      scope.run(function* () {
        yield* put(action);
      });
      return result;
    };
  }
  const store = configureStore({
    reducer: state,
    middleware: [middleware],
  });

  return { run, scope, ...store };
}

const z = {
  table: function table<Entity>(
    initialEntity: MapEntity<Entity> = {}
  ): Reducer<MapEntity<Entity>, Action> {
    return (s: any = initialEntity) => s;
  },

  list: function list<Entity>(
    initialEntity: Entity[] = []
  ): Reducer<Entity[], Action> {
    return (s: any = initialEntity) => s;
  },

  str: function str(initial = ""): Reducer<string, Action> {
    return (s: any = initial) => s;
  },

  schema: function <State extends AnyState = AnyState>(
    S: StateSchema<State>
  ): StateSchema<State> {
    return S;
  },
};

const schema = z.schema({
  users: z.table<User>(),
  userIds: z.list<string>(),
  token: z.str(),
});

it(tests, "should work", () => {
  const store = createStore(schema);
  expect(true).toBe(true);
});
