import test from "ava";
import { run, call, put, stdChannel, createRuntime } from "./index.js";

const last = (arr: any[]) => arr[arr.length - 1];

const dropRight = (n: number, arr: any[]) => {
  const copy = [...arr];
  while (n > 0) {
    copy.length = copy.length - 1;
    n--;
  }
  return copy;
};

test("iterates through generators and returns value", async (t) => {
  function* one() {
    return 1;
  }
  function* fx() {
    const value = yield* call(one);
    t.deepEqual(value, 1);
  }

  await run(fx).toPromise();
  t.pass();
});

test("when there's an error", async (t) => {
  function* fx() {
    throw new Error("something happened");
  }

  try {
    await run(fx).toPromise();
  } catch (err: any) {
    t.deepEqual("something happened", err.message);
  }
});

test("runtime iteration", async (t) => {
  const actual: number[] = [];

  function* genFn(): Generator<any, any, number> {
    actual.push(yield 1);
    actual.push(yield 2);
    return 3;
  }

  const task = run(genFn);
  const isPromise = (f: any) => f && typeof f.then === "function";
  t.true(isPromise(task.toPromise()), "must return promise");

  const res = await task.toPromise();
  t.false(
    task.isRunning(),
    "returned promise should resolve with the iterator return value",
  );
  t.deepEqual(res, 3, "should collect yielded values from the iterator");
  t.deepEqual(actual, [1, 2], "should return all yielded values");
});

test("output handling", async (t) => {
  const actual: any[] = [];
  const channel = stdChannel();
  const runtime = createRuntime({ channel });
  channel.subscribe((action) => {
    actual.push(action.type);
  });

  function* genFn(arg: string) {
    yield put({
      type: arg,
    });
    yield put({
      type: "2",
    });
  }

  await runtime(genFn, "arg").toPromise();
  const expected = ["arg", "2"];
  t.deepEqual(actual, expected, "must handle generator output");
});

test("yielded falsy values", async (t) => {
  const actual: any[] = [];

  function* genFn(): Generator {
    actual.push(yield false);
    actual.push(yield undefined);
    actual.push(yield null);
    actual.push(yield "");
    actual.push(yield 0);
    actual.push(yield NaN);
  }

  await run(genFn).toPromise();

  const expected = [false, undefined, null, "", 0, NaN];
  t.true(isNaN(last(actual)), "must inject back yielded falsy values");
  t.deepEqual(dropRight(1, actual), dropRight(1, expected));
});
