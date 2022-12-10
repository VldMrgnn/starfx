import test from "ava";
import { Action, run, symbols, take } from "./index.js";

test("take from default channel", async (t) => {
  const typeSymbol = Symbol("action-symbol");
  const actual: any[] = [];

  function* genFn(): Generator {
    try {
      actual.push(yield* take("*")); // take all actions
      actual.push(yield* take("action-1")); // take only actions of type 'action-1'
      actual.push(yield* take(["action-2", "action-2222"])); // take either type
      actual.push(yield* take((a: Action) => a.payload?.isAction)); // take if match predicate
      actual.push(
        yield* take([
          "action-3",
          (a: Action) => a.payload?.isMixedWithPredicate,
        ]),
      ); // take if match any from the mixed array
      actual.push(
        yield* take([
          "action-3",
          (a: Action) => a.payload?.isMixedWithPredicate,
        ]),
      ); // take if match any from the mixed array
      actual.push(yield* take(typeSymbol)); // take only actions of a Symbol type
      actual.push(yield* take("never-happening-action")); //  should get END
    } finally {
      actual.push("auto ended");
    }
  }

  const task = run(genFn);

  await Promise.resolve();

  task.channel.put({
    type: "action-*",
  });

  await Promise.resolve();

  task.channel.put({
    type: "action-1",
  });

  await Promise.resolve();

  task.channel.put({
    type: "action-2",
  });

  await Promise.resolve();

  task.channel.put({
    type: "unnoticeable-action",
  });

  await Promise.resolve();

  task.channel.put({
    type: "",
    payload: {
      isAction: true,
    },
  });

  await Promise.resolve();

  task.channel.put({
    type: "",
    payload: {
      isMixedWithPredicate: true,
    },
  });

  await Promise.resolve();

  task.channel.put({
    type: "action-3",
  });

  await Promise.resolve();

  task.channel.put({
    type: typeSymbol,
  });

  await Promise.resolve();

  task.channel.put({
    type: symbols.end,
  });

  const expected = [
    {
      type: "action-*",
    },
    {
      type: "action-1",
    },
    {
      type: "action-2",
    },
    {
      type: "",
      payload: {
        isAction: true,
      },
    },
    {
      type: "",
      payload: {
        isMixedWithPredicate: true,
      },
    },
    {
      type: "action-3",
    },
    {
      type: typeSymbol,
    },
    "auto ended",
  ];

  await task.toPromise();
  t.deepEqual(actual, expected);
});
