import test from "ava";
import { run, call, put, stdChannel, createRuntime } from "./index.js";

test("handles call effects and resume with the resolved values", async (t) => {
  const actual: any[] = [];

  class C {
    val: any;

    constructor(val: any) {
      this.val = val;
    }

    method() {
      return Promise.resolve(this.val);
    }
  }

  const inst1 = new C(1);
  const inst2 = new C(2);
  const inst3 = new C(3);
  const inst4 = new C(4);
  const inst5 = new C(5);
  const inst6 = new C(6);

  const eight = Symbol(8);

  function* subGen(name: string, arg: number) {
    yield Promise.resolve(name);
    return arg;
  }

  function identity(arg: any) {
    return arg;
  }

  function* genFn() {
    actual.push(yield* call([inst1, inst1.method]));
    actual.push(yield* call([inst2, "method"]));
    actual.push(yield* call([inst3, inst3.method]));
    actual.push(yield* call([inst4, "method"]));
    actual.push(yield* call({ context: inst5, fn: inst5.method }));
    actual.push(yield* call({ context: inst6, fn: "method" }));
    actual.push(yield* call(subGen, "something", 7));
    actual.push(yield* call(identity, eight));
  }

  await run(genFn).toPromise();
  const expected = [1, 2, 3, 4, 5, 6, 7, eight];
  t.deepEqual(actual, expected);
});

test("handles call effects and throw the rejected values inside the generator", async (t) => {
  const actual: any[] = [];

  const channel = stdChannel();
  channel.subscribe((action) => {
    actual.push(action.type);
  });
  const runtime = createRuntime({ channel });

  function fail(msg: string) {
    return Promise.reject(msg);
  }

  function* genFnParent() {
    try {
      yield put({
        type: "start",
      });
      yield call(fail, "failure");
      yield put({
        type: "success",
      });
    } catch (e: any) {
      yield put({
        type: e,
      });
    }
  }

  await runtime(genFnParent).toPromise();
  const expected = ["start", "failure"];
  t.deepEqual(actual, expected);
});

test("handles call's synchronous failures and throws in the calling generator (1)", async (t) => {
  const actual: any[] = [];
  const channel = stdChannel();
  channel.subscribe((action) => {
    actual.push(action.type);
  });
  const runtime = createRuntime({ channel });

  function fail(message: string) {
    throw new Error(message);
  }

  function* genFnChild() {
    try {
      yield put({
        type: "startChild",
      });
      yield call(fail, "child error");
      yield put({
        type: "success child",
      });
    } catch (e) {
      yield put({
        type: "failure child",
      });
    }
  }

  function* genFnParent() {
    try {
      yield put({
        type: "start parent",
      });
      yield call(genFnChild);
      yield put({
        type: "success parent",
      });
    } catch (e) {
      yield put({
        type: "failure parent",
      });
    }
  }

  await runtime(genFnParent).toPromise();
  const expected = [
    "start parent",
    "startChild",
    "failure child",
    "success parent",
  ];
  t.deepEqual(actual, expected);
});

test("handles call's synchronous failures and throws in the calling generator (2)", async (t) => {
  const actual: any[] = [];
  const channel = stdChannel();
  channel.subscribe((action) => {
    actual.push(action.type);
  });
  const runtime = createRuntime({ channel });

  function fail(message: string) {
    throw new Error(message);
  }

  function* genFnChild() {
    try {
      yield put({
        type: "startChild",
      });
      yield call(fail, "child error");
      yield put({
        type: "success child",
      });
    } catch (e) {
      yield put({
        type: "failure child",
      });
      throw e;
    }
  }

  function* genFnParent() {
    try {
      yield put({
        type: "start parent",
      });
      yield call(genFnChild);
      yield put({
        type: "success parent",
      });
    } catch (e) {
      yield put({
        type: "failure parent",
      });
    }
  }

  await runtime(genFnParent).toPromise();
  const expected = [
    "start parent",
    "startChild",
    "failure child",
    "failure parent",
  ];
  t.deepEqual(actual, expected);
});
