import test from "ava";
import { run, call, fork } from "../index.js";

test("return forked value from task", async (t) => {
  t.plan(1);
  function fn() {
    return "activated";
  }

  function* genFn(): Generator {
    const task = yield* fork(() => call(fn));
    return task;
  }

  const actual = await run(genFn);
  t.deepEqual(actual, "activated");
});

test("should interpret returned promise. fork(() => promise)", async (t) => {
  function* genFn(): Generator {
    const task = yield* fork(() => Promise.resolve("a"));
    return task;
  }

  const actual = await run(genFn);
  t.deepEqual(actual, "a");
});

test("should handle promise that resolves undefined properly. fork(() => Promise.resolve(undefined))", async (t) => {
  function* genFn() {
    const task = yield* fork(() => Promise.resolve(undefined));
    return task;
  }

  const actual = await run(genFn);
  t.deepEqual(actual, undefined);
});
