import test from "ava";
import { run, deferred, all, take, call, symbols } from "./index.js";

test("parallel effects handling", async (t) => {
  let actual: any;
  const def = deferred();
  const cb = deferred();

  function* fn(): Generator {
    return yield cb.promise;
  }

  function* genFn(): Generator {
    actual = yield* all([def.promise, call(fn), take("action")]);
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

  await task.toPromise();

  t.deepEqual(actual, expected, "must fulfill parallel effects");
});

test("empty array", async (t) => {
  let actual: any;

  function* genFn() {
    actual = yield* all([]);
  }

  const expected: any[] = [];

  await run(genFn).toPromise();

  t.deepEqual(
    actual,
    expected,
    "must fulfill empty parallel effects with an empty array",
  );
});

test("parallel effect: handling errors", async (t) => {
  let actual: any;
  const defs = [deferred(), deferred()];

  await Promise.resolve(1);
  defs[0]?.reject("error");
  defs[1]?.resolve(1);

  function* genFn(): Generator {
    try {
      actual = yield* all([defs[0]?.promise, defs[1]?.promise]);
    } catch (err) {
      actual = [err];
    }
  }

  const expected = ["error"];
  await run(genFn).toPromise();
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
      actual = yield* all([def.promise, take("action")]);
    } finally {
      actual = "end";
    }
  }

  const task = run(genFn);

  await Promise.resolve(1);
  def.resolve(1);
  task.channel.put({ type: symbols.end });

  await task.toPromise();
  t.deepEqual(
    actual,
    "end",
    "must end parallel effect if one of the effects resolve with END",
  );
});

test("parallel effect: named effects", async (t) => {
  let actual: any;
  const def = deferred();

  function* genFn() {
    actual = yield* all({
      ac: take("action"),
      prom: def.promise,
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

  await task.toPromise();

  t.deepEqual(actual, expected, "must handle parallel named effects");
});
