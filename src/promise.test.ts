import test from "ava";
import { run, cancel, delay, fork, symbols } from "./index.js";
import type { TaskItem } from "./index.js";

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

  await run(genFn).toPromise();
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

  await run(genFn).toPromise();
  const expected = ["caught undefined"];
  t.deepEqual(actual, expected);
});

test("calling toPromise() of an already completed task", async (t) => {
  const result = "result-of-saga";

  const task = run(function* saga() {
    return result;
  });

  t.false(task.isRunning());
  const actual = await task.toPromise();
  t.deepEqual(actual, result);
});

test("calling toPromise() before a task completes", async (t) => {
  const result = "result-of-saga";

  const task = run(function* saga() {
    yield* delay(10);
    return result;
  });

  t.true(task.isRunning());
  const actual = await task.toPromise();
  t.deepEqual(actual, result);
});

test("calling toPromise() before a task aborts", async (t) => {
  const error = new Error("test-error");

  const task = run(function* saga() {
    yield delay(10);
    throw error;
  });

  t.true(task.isRunning());
  try {
    await task.toPromise();
  } catch (err) {
    t.deepEqual(err, error);
  }
});

test("calling toPromise() of an already cancelled task", async (t) => {
  let child: TaskItem | null = null;

  run(function* (): Generator {
    child = yield* fork(function* child() {
      yield delay(10000);
    });
    yield cancel(child);
  });

  if (!child) {
    t.fail();
    return;
  }
  child = child as TaskItem;
  t.false(child.isRunning());
  const actual = await child.toPromise();
  t.deepEqual(actual, symbols.cancel);
});

test("calling toPromise() of before a task gets cancelled", async (t) => {
  let child: TaskItem | null = null;

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
  child = child as TaskItem;
  t.true(child.isRunning());
  const actual = await child.toPromise();
  t.deepEqual(actual, symbols.cancel);
});
