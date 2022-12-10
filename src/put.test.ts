import test from "ava";
import {
  run,
  take,
  fork,
  put,
  stdChannel,
  createRuntime,
  delay,
  deferred,
  symbols,
  delayP,
} from "./index.js";

test("handling", async (t) => {
  let actual: any[] = [];
  const channel = stdChannel();
  const unsub = channel.subscribe((action) => {
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

  const runtime = createRuntime({ channel });
  await runtime(genFn, "arg").toPromise();
  unsub();
  const expected = ["arg", "2"];
  t.deepEqual(actual, expected);
});

test("nested puts handling", async (t) => {
  let actual: string[] = [];

  function* genA() {
    yield put({
      type: "a",
    });
    actual.push("put a");
  }

  function* genB() {
    yield* take("a");
    yield put({
      type: "b",
    });
    actual.push("put b");
  }

  function* root() {
    yield* fork(genB); // forks genB first to be ready to take before genA starts putting
    yield* fork(genA);
  }

  const expected = ["put a", "put b"];
  await run(root).toPromise();
  t.deepEqual(actual, expected);
});

test("puts emitted while dispatching saga need not to cause stack overflow", async (t) => {
  function* root() {
    yield put({
      type: "put a lot of actions",
    });
    yield delay(0);
  }

  const channel = stdChannel();
  const rawPut = channel.put;
  channel.put = () => {
    for (let i = 0; i < 32768; i++) {
      rawPut({ type: "test" });
    }
  };

  const run = createRuntime({ channel });
  await run(root).toPromise();
  t.pass();
});

test("puts emitted directly after creating a task (caused by another put) should not be missed by that task", async (t) => {
  const actual: string[] = [];
  let callSubscriber = false;

  const channel = stdChannel();
  const unsub = channel.subscribe(() => {
    if (!callSubscriber) {
      return;
    }
    channel.put({ type: "c" });
    channel.put({ type: "do not miss" });
    callSubscriber = false;
  });
  const runtime = createRuntime({ channel });

  function* root() {
    yield* take("a");
    yield put({
      type: "b",
    });
    callSubscriber = true;
    yield* take("c");
    yield* fork(function* () {
      yield* take("do not miss");
      actual.push("didn't get missed");
    });
  }

  const task = runtime(root);
  channel.put({
    type: "a",
  });

  const expected = ["didn't get missed"];
  await task.toPromise();
  unsub();
  t.deepEqual(actual, expected);
});

test("END should reach tasks created", async (t) => {
  const actual: string[] = [];

  function* subTask() {
    try {
      while (true) {
        actual.push("subTask taking END");
        yield* take("NEXT");
        actual.push("should not get here");
      }
    } finally {
      actual.push("auto ended");
    }
  }

  const def = deferred();

  function* root() {
    while (true) {
      yield* take("START");
      actual.push("start taken");
      yield def.promise;
      actual.push("non-take effect resolved");
      yield* fork(subTask);
      actual.push("subTask forked");
    }
  }

  const channel = stdChannel();
  const runtime = createRuntime({ channel });
  const task = runtime(root);

  await delayP(0);

  channel.put({
    type: "START",
  });

  if (def?.resolve) {
    def.resolve(undefined);
  }

  channel.put({ type: symbols.end });

  channel.put({
    type: "NEXT",
  });

  channel.put({
    type: "START",
  });

  const expected = [
    "start taken",
    "non-take effect resolved",
    "subTask taking END",
    "auto ended",
    "subTask forked",
  ];

  await task.toPromise();
  t.deepEqual(actual, expected);
});
