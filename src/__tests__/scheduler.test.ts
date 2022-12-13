import { createScheduler } from "../scheduler.js";
import test from "ava";

test("scheduler() - executes all recursively triggered tasks in order", (t) => {
  const { asap } = createScheduler();
  const actual: string[] = [];
  asap(() => {
    actual.push("1");
    asap(() => {
      actual.push("2");
    });
    asap(() => {
      actual.push("3");
    });
  });
  t.deepEqual(actual, ["1", "2", "3"]);
});

test("scheduler() - when suspended queues up and executes all tasks on flush", (t) => {
  const { immediately, asap } = createScheduler();
  const actual: string[] = [];
  immediately(() =>
    asap(() => {
      actual.push("1");
      asap(() => {
        actual.push("2");
      });
      asap(() => {
        actual.push("3");
      });
    }),
  );
  t.deepEqual(actual, ["1", "2", "3"]);
});
