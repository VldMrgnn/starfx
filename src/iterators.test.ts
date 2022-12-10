import test from "ava";
import { deferred, createRuntime, stdChannel, take, delayP } from "./index.js";

test("nested iterator handling", async (t) => {
  const actual: any[] = [];
  const defs = [deferred(), deferred(), deferred()];
  const channel = stdChannel();
  const runtime = createRuntime({ channel });

  function* child(): Generator {
    actual.push(yield defs[0]?.promise);
    actual.push(yield* take("action-1"));
    actual.push(yield defs[1]?.promise);
    actual.push(yield* take("action-2"));
    actual.push(yield defs[2]?.promise);
    actual.push(yield* take("action-3"));
    actual.push(yield Promise.reject("child error"));
  }

  function* main() {
    try {
      yield child();
    } catch (e) {
      actual.push(`caught ${e}`);
    }
  }

  const task = runtime(main);

  await delayP(0);
  defs[0]?.resolve?.(1);
  await delayP(0);
  channel.put({
    type: "action-1",
  });

  await delayP(0);
  defs[1]?.resolve?.(2);
  await delayP(0);
  channel.put({
    type: "action-2",
  });

  await delayP(0);
  defs[2]?.resolve?.(3);
  await delayP(0);
  channel.put({
    type: "action-3",
  });

  await task.toPromise();

  const expected = [
    1,
    {
      type: "action-1",
    },
    2,
    {
      type: "action-2",
    },
    3,
    {
      type: "action-3",
    },
    "caught child error",
  ];
  t.deepEqual(actual, expected);
});
