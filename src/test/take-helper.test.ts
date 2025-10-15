import { spawn, suspend } from "effection";
import type { AnyAction } from "../index.js";
import { sleep, take, takeEvery, takeLatest, takeLeading } from "../index.js";
import { createStore } from "../store/index.js";
import { expect, test } from "../test.js";
import { parallel } from "../fx/index.js";
import { put } from "../action.js";

test("should cancel previous tasks and only use latest", async () => {
  const actual: string[] = [];
  function* worker(action: AnyAction) {
    if (action.payload !== "3") {
      // TODO why is this needed?
      yield* sleep(0);
    }
    actual.push(action.payload);
  }

  function* root() {
    const task = yield* spawn(() => takeLatest("ACTION", worker));
    yield* take("CANCEL_WATCHER");
    yield* task.halt();
  }
  const store = createStore({ initialState: {} });
  const task = store.run(root);

  store.dispatch({ type: "ACTION", payload: "1" });
  store.dispatch({ type: "ACTION", payload: "2" });
  store.dispatch({ type: "ACTION", payload: "3" });
  store.dispatch({ type: "CANCEL_WATCHER" });

  await task;

  expect(actual).toEqual(["3"]);
});

test("should keep first action and discard the rest", async () => {
  let called = 0;
  const actual: string[] = [];
  function* worker(action: AnyAction) {
    called += 1;
    // TODO why is this needed?
    yield* sleep(0);
    actual.push(action.payload);
  }

  function* root() {
    const task = yield* spawn(() => takeLeading("ACTION", worker));
    // wait until following dispatches have been processed
    yield* sleep(150);
    yield* task.halt();
  }
  const store = createStore({ initialState: {} });
  const task = store.run(root);

  store.dispatch({ type: "ACTION", payload: "1" });
  store.dispatch({ type: "ACTION", payload: "2" });
  store.dispatch({ type: "ACTION", payload: "3" });

  await task;

  expect(actual).toEqual(["1"]);
  expect(called).toEqual(1);
});

test("should receive all actions", async () => {
  const loop = 10;
  const actual: string[][] = [];

  function* root() {
    const task = yield* spawn(() =>
      takeEvery("ACTION", (action) => worker("a1", "a2", action)),
    );
    yield* take("CANCEL_WATCHER");
    yield* task.halt();
  }

  // deno-lint-ignore require-yield
  function* worker(arg1: string, arg2: string, action: AnyAction) {
    actual.push([arg1, arg2, action.payload]);
  }

  const store = createStore({ initialState: {} });
  const task = store.run(root);

  for (let i = 1; i <= loop / 2; i += 1) {
    store.dispatch({
      type: "ACTION",
      payload: i,
    });
  }

  // no further task should be forked after this
  store.dispatch({
    type: "CANCEL_WATCHER",
  });

  for (let i = loop / 2 + 1; i <= loop; i += 1) {
    store.dispatch({
      type: "ACTION",
      payload: i,
    });
  }
  await task;

  expect(actual).toEqual([
    ["a1", "a2", 1],
    ["a1", "a2", 2],
    ["a1", "a2", 3],
    ["a1", "a2", 4],
    ["a1", "a2", 5],
  ]);
});

test("take and takeEvery in the same root with the same action type", async () => {
  expect.assertions(1);
  const actual: string[] = [];

  function* root() {
    const group = yield* parallel([
      function* () {
        yield* takeEvery("ACTION", function* (ap) {
          actual.push("takeEvery:" + ap.payload);
        });
      },
      function* () {
        while (true) {
          const action = yield* take("*");
          if (action.type === "ACTION") {
            actual.push("take:" + action.payload);
          }
        }
      },
    ]);
    yield* group;
  }

  const store = createStore({ initialState: {} });
  store.run(root);
  store.dispatch({ type: "ACTION", payload: "1" });
  expect([...actual].sort()).toEqual(["takeEvery:1", "take:1"].sort());
});


test.skip("take and takeEvery in the same and puts", async () => {
  expect.assertions(1);
  const actual: string[] = [];
  const other: string[] = [];

  function* root() {
    const group = yield* parallel([
      function* () {
        yield* takeEvery("ACTION", function* (ap) {
          actual.push("takeEvery:" + ap.payload);
          // with this timeout the output changes completely.
          // yield* sleep(0);
          yield* put({ type: "OTHER", payload: "ANY" });
        });
      },
      function* () {
        while (true) {
          const action = yield* take("*");
          if (action.type === "ACTION") {
            actual.push("take:" + action.payload);
          }
          if (action.type === "OTHER") {
            other.push("other:" + action.payload);
          }
        }
      }
    ]);
    yield* group;
  }

  const store = createStore({ initialState: {} });
  store.run(root);
  store.dispatch({ type: "ACTION", payload: "1" });

  expect([...actual].sort()).toEqual(["takeEvery:1", "take:1"].sort());
  expect([...other].sort()).toEqual(["other:ANY"]);
});


test("plain take can miss actions between iterations", async function () {
  expect.assertions(1);
  const seen: number[] = [];
  function* root() {
      while (true) {
        const a: any = yield* take((x: any) => x.type === "PING");
        seen.push(a.id);
        yield* sleep(2); // simulate work
      }
  }
  const store = createStore({ initialState: {} });
  store.run(root);
  store.dispatch({ type: "PING", id: 1 });
  store.dispatch({ type: "PING", id: 2 });
  store.dispatch({ type: "PING", id: 3 });
  // at least one missed. 
  expect(seen.length).toBeLessThan(3);
});
