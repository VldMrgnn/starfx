import test from "ava";
import { run, cancel, delay, fork, symbols } from "../index.js";
import type { Task } from "../index.js";
// import "trace-unhandled/register.js";

test("native promise handling", async (t) => {
  const actual: any[] = [];

  function* genFn(): Generator {
    try {
      actual.push(yield Promise.resolve(1));
      actual.push(yield Promise.reject("error"));
    } catch (e) {
      actual.push(`caught ${e}`);
    }
  }

  await run(genFn);
  const expected = [1, "caught error"];
  t.deepEqual(actual, expected);
});

test("native promise handling: undefined errors", async (t) => {
  const actual: any[] = [];

  function* genFn(): Generator {
    try {
      actual.push(yield Promise.reject());
    } catch (e) {
      actual.push(`caught ${e}`);
    }
  }

  await run(genFn);
  const expected = ["caught undefined"];
  t.deepEqual(actual, expected);
});

test("awaiting an already completed task", async (t) => {
  const result = "result-of-saga";

  const task = run(function* saga() {
    return result;
  });

  t.false(task.status() === "running");
  const actual = await task;
  t.deepEqual(actual, result);
});

test("awaiting before a task completes", async (t) => {
  const result = "result-of-saga";

  const task = run(function* saga() {
    yield* delay(10);
    return result;
  });

  t.true(task.status() === "running");
  const actual = await task;
  t.deepEqual(actual, result);
});

test("awaiting before a task aborts", async (t) => {
  const error = new Error("test-error");

  const task = run(function* saga() {
    yield delay(10);
    throw error;
  });

  t.true(task.status() === "running");
  try {
    await task;
  } catch (err) {
    t.deepEqual(err, error);
  }
});

test("awaiting an already cancelled task", async (t) => {
  let child: Task | null = null;

  run(function* (): Generator {
    child = yield* fork(function* () {
      yield* delay(2000);
    });
    yield* cancel(child);
  });

  if (!child) {
    t.fail();
    return;
  }
  child = child as Task;
  t.false(child.status() === "running");
  // TODO: fix types?
  const actual: any = await child;
  t.deepEqual(actual, symbols.cancel);
});

test("awaiting before a task gets cancelled", async (t) => {
  let child: Task | null = null;

  run(function* (): Generator {
    child = yield* fork(function* child() {
      yield delay(10000);
    });
    yield delay(10);
    yield cancel(child);
  });

  if (!child) {
    t.fail();
    return;
  }
  child = child as Task;
  t.true(child.status() === "running");
  // TODO: fix types?
  const actual: any = await child;
  t.deepEqual(actual, symbols.cancel);
});
