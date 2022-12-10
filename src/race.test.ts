import test from "ava";
import { deferred, race, take, symbols, createRuntime } from "./index.js";

test("race between effects handling", async (t) => {
  let resultOfRace: any = "initial";
  const timeout = deferred();

  function* genFn() {
    resultOfRace = yield* race({
      event: take("action"),
      timeout: timeout.promise,
    });
  }

  const task = createRuntime()(genFn);
  const expected = {
    timeout: 1,
  };

  await Promise.resolve();

  timeout.resolve(1);

  await Promise.resolve();

  task.channel.put({
    type: "action",
  });

  await task.toPromise();

  t.deepEqual(resultOfRace, expected, "must fulfill race between effects");
});

test("race between array of effects handling", async (t) => {
  let actual: any[] = [];
  const timeout = deferred();

  function* genFn() {
    const result = yield* race([take("action-2"), timeout.promise]);
    actual.push(result);
  }

  const task = createRuntime()(genFn);

  await Promise.resolve();

  timeout.resolve(2);

  await Promise.resolve();

  task.channel.put({
    type: "action-2",
  });

  await task.toPromise();

  const expected = [[undefined, 2]];
  t.deepEqual(actual, expected, "must fulfill race between array of effects");
});

test("race between effects: handle END", async (t) => {
  const timeout = deferred();
  let resultOfRace: any = "initial";
  let called = false;

  function* genFn() {
    called = true;
    resultOfRace = yield* race({
      event: take("action-3"),
      task: timeout.promise,
    });
  }

  const task = createRuntime()(genFn);

  task.channel.put({ type: symbols.end });

  await Promise.resolve();

  timeout.resolve(1);

  await task.toPromise();

  t.true(called, "must end race effect if one of the effects resolve with END");
  t.deepEqual(resultOfRace, { event: undefined });
});
