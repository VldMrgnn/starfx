import test from "ava";
import { run, deferred, all, take, call, symbols } from "../index.js";

test("empty array", async (t) => {
  let actual: any;

  function* genFn() {
    actual = yield* all([]);
  }

  const expected: any[] = [];

  await run(genFn);

  t.deepEqual(
    actual,
    expected,
    "must fulfill empty parallel effects with an empty array",
  );
});

test("parallel effects handling", async (t) => {
  let actual: any;
  const def = deferred();
  const cb = deferred();

  function* fn(): Generator {
    return yield cb;
  }

  function* genFn(): Generator {
    actual = yield* all([def, call(fn), take("action")]);
  }

  const task = run(genFn);

  await Promise.resolve(1);
  def.resolve(1);
  cb.resolve?.(2);
  task.channel.put({ type: "action" });

  const expected = [
    1,
    2,
    {
      type: "action",
    },
  ];

  await task;

  t.deepEqual(actual, expected, "must fulfill parallel effects");
});

test("parallel effect: handling errors", async (t) => {
  let actual: any;
  const defs = [deferred(), deferred()];

  await Promise.resolve(1);
  defs[0]?.reject("error");
  defs[1]?.resolve(1);

  function* genFn(): Generator {
    try {
      actual = yield* all([defs[0], defs[1]]);
    } catch (err) {
      actual = [err];
    }
  }

  const expected = ["error"];
  await run(genFn);
  t.deepEqual(
    actual,
    expected,
    "must catch the first error in parallel effects",
  );
});

test("parallel effect: handling END", async (t) => {
  let actual: any;
  const def = deferred();

  function* genFn() {
    try {
      actual = yield* all([def, take("action")]);
    } finally {
      actual = "end";
    }
  }

  const task = run(genFn);

  await Promise.resolve(1);
  def.resolve(1);
  task.channel.put({ type: symbols.end });

  await task;
  t.deepEqual(
    actual,
    "end",
    "must end parallel effect if one of the effects resolve with END",
  );
});

test.skip("parallel effect: named effects", async (t) => {
  let actual: any;
  const def = deferred();

  function* genFn() {
    actual = yield* all({
      ac: take("action"),
      prom: def,
    });
  }

  const task = run(genFn);
  await Promise.resolve(1);
  def.resolve(1);
  task.channel.put({
    type: "action",
  });

  const expected = {
    ac: {
      type: "action",
    },
    prom: 1,
  };

  await task;

  t.deepEqual(actual, expected, "must handle parallel named effects");
});
