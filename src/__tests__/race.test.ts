import test from "ava";
import {
  deferred,
  race,
  take,
  symbols,
  createRuntime,
  delayP,
} from "../index.js";

test("race between effects handling", async (t) => {
  let resultOfRace: any = "initial";
  const timeout = deferred();

  function* genFn() {
    resultOfRace = yield* race({
      event: take("action"),
      timeout: timeout,
    });
  }

  const task = createRuntime()(genFn);
  const expected = [1];

  await Promise.resolve();

  timeout.resolve(1);

  await delayP(0);

  task.channel.put({
    type: "action",
  });

  await task;

  t.deepEqual(resultOfRace, expected, "must fulfill race between effects");
});

test("race between array of effects handling", async (t) => {
  let actual: any[] = [];
  const timeout = deferred();

  function* genFn() {
    const result = yield* race([take("action-2"), timeout]);
    actual.push(result);
  }

  const task = createRuntime()(genFn);

  await Promise.resolve();

  timeout.resolve(2);

  await delayP(0);

  task.channel.put({
    type: "action-2",
  });

  await task;

  const expected = [[2]];
  t.deepEqual(actual, expected, "must fulfill race between array of effects");
});

test("race between effects: handle END", async (t) => {
  const timeout = deferred();
  let resultOfRace: any = "initial";
  let called = false;

  function* genFn() {
    called = true;
    resultOfRace = yield* race([take("action-3"), timeout]);
  }

  const task = createRuntime()(genFn);

  task.channel.put({ type: symbols.end });

  await Promise.resolve();

  timeout.resolve(1);

  await task;

  t.true(called, "must end race effect if one of the effects resolve with END");
  t.deepEqual(resultOfRace, [undefined]);
});
