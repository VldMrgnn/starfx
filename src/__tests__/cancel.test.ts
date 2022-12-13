import test from "ava";
import {
  deferred,
  call,
  cancelled,
  run,
  fork,
  take,
  all,
  race,
  cancel,
  delay,
  Task,
  delayP,
} from "../index.js";
// import "trace-unhandled/register.js";

test("cancellation: call effect", async (t) => {
  const actual: any[] = [];
  const startDef = deferred();
  const subroutineDef = deferred();

  function* subroutine(): Generator {
    actual.push(yield "subroutine start");

    try {
      actual.push(yield subroutineDef);
    } finally {
      const isCancelled = yield* cancelled();
      if (isCancelled) {
        actual.push(yield "subroutine cancelled");
      }
    }
  }

  function* main(): Generator {
    actual.push(yield startDef);

    try {
      actual.push(yield* call(subroutine));
    } finally {
      const isCancelled = yield* cancelled();
      if (isCancelled) {
        actual.push("cancelled");
      }
    }
  }

  const task = run(main);

  await delayP(10);
  startDef.resolve("start");
  await delayP(10);
  actual.push("cancel");
  task.cancel("cancel");
  await delayP(10);
  subroutineDef.resolve("subroutine");

  await task;

  const expected = [
    "start",
    "subroutine start",
    "cancel",
    "subroutine cancelled",
    "cancelled",
  ];

  t.deepEqual(
    actual,
    expected,
    "cancelled call effect must throw exception inside called subroutine",
  );
});

test("cancellation: simple forked children", async (t) => {
  const actual: any[] = [];
  const rootDef = deferred<string>();
  const childDef = deferred<string>();
  const leafDef = deferred<string>();
  const cancelDef = deferred<string>();
  const neverDef = deferred<string>();

  function* main(): Generator {
    try {
      yield* fork(child);
      actual.push(yield rootDef);
      yield neverDef;
    } finally {
      if (yield* cancelled()) {
        actual.push("main cancelled");
      }
    }
  }

  function* child(): Generator {
    try {
      yield* fork(leaf);
      actual.push(yield childDef);
      yield neverDef;
    } finally {
      if (yield* cancelled()) {
        actual.push("child cancelled");
      }
    }
  }

  function* leaf(): Generator {
    try {
      actual.push(yield leafDef);
    } finally {
      if (yield* cancelled()) {
        actual.push("leaf cancelled");
      }
    }
  }

  const task = run(main);

  cancelDef.then((r) => task.cancel(r));

  Promise.resolve()
    .then(() => childDef.resolve("child resolve"))
    .then(() => rootDef.resolve("main resolve"))
    .then(() => leafDef.resolve("leaf resolve"))
    .then(() => cancelDef.resolve("manual cancel"));

  await task;

  const expected: string[] = [
    "child resolve",
    "main resolve",
    "leaf resolve",
    "leaf cancelled",
    "child cancelled",
    "main cancelled",
  ];
  t.deepEqual(actual, expected);
});

test("cancellation: forked children", async (t) => {
  const actual: any[] = [];
  const cancelDef = deferred("cancelDef");
  const rootDef = deferred("rootDef");
  const childAdef = deferred("childAdef");
  const childBdef = deferred("childBdef");
  const neverDef = deferred("neverDef");

  const defs = [deferred(), deferred(), deferred(), deferred()];

  function* main(): Generator {
    try {
      yield* fork(childA);
      actual.push(yield rootDef);
      yield* fork(childB);
      yield neverDef;
    } finally {
      if (yield* cancelled()) {
        actual.push("main cancelled");
      }
    }
  }

  function* childA(): Generator {
    try {
      yield* fork(leaf, 0);
      actual.push(yield childAdef);
      yield* fork(leaf, 1);
      yield neverDef;
    } finally {
      if (yield* cancelled()) {
        actual.push("childA cancelled");
      }
    }
  }

  function* childB(): Generator {
    try {
      yield* fork(leaf, 2);
      actual.push(yield childBdef);
      yield* fork(leaf, 3);
      yield neverDef;
    } finally {
      if (yield* cancelled()) {
        actual.push("childB cancelled");
      }
    }
  }

  function* leaf(idx: any): Generator {
    try {
      actual.push(yield defs[idx]);
    } finally {
      if (yield* cancelled()) {
        actual.push(`leaf ${idx} cancelled`);
      }
    }
  }

  const task = run(main);

  cancelDef.then(() => {
    task.cancel("cancel test");
  });

  await Promise.resolve()
    .then(() => childAdef.resolve("childA resolve"))
    .then(() => rootDef.resolve("root resolve"))
    .then(() => defs[0]?.resolve("leaf 0 resolve"))
    .then(() => childBdef.resolve("childB resolve")) //
    .then(() => delayP(0))
    .then(() => cancelDef.resolve("cancel"))
    .then(() => delayP(0))
    .then(() => defs[3]?.resolve("leaf 3 resolve"))
    .then(() => defs[2]?.resolve("leaf 2 resolve"))
    .then(() => defs[1]?.resolve("leaf 1 resolve"));

  await task;

  const expected = [
    "childA resolve",
    "root resolve",
    "leaf 0 resolve",
    "childB resolve",
    /* cancel */
    "main cancelled",
    "childB cancelled",
    "leaf 3 cancelled",
    "leaf 2 cancelled",
    "childA cancelled",
    "leaf 1 cancelled",
  ];

  t.deepEqual(
    actual,
    expected,
    "cancelled main task must cancel all forked sub-tasks",
  );
});

test.only("cancellation: take effect", async (t) => {
  const actual: any[] = [];
  const startDef = deferred();
  const cancelDef = deferred();

  function* main(): Generator {
    actual.push(yield startDef);

    try {
      actual.push(yield* take("action"));
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "cancelled");
      }
    }
  }

  const task = run(main);

  cancelDef.then((v) => {
    actual.push(v);
    task.cancel("cancel test");
  });

  Promise.resolve()
    .then(() => startDef.resolve("start"))
    .then(() => delayP(10))
    .then(() => cancelDef.resolve("cancel"))
    .then(() =>
      task.channel.put({
        type: "action",
      }),
    );

  await task;

  const expected = ["start", "cancel", "cancelled"];

  t.deepEqual(
    actual,
    expected,
    "cancelled take effect must stop waiting for action",
  );
});

test("cancellation: parallel effect", async (t) => {
  const actual: any[] = [];
  const startDef = deferred();
  const cancelDef = deferred();
  const subroutineDefs = [deferred(), deferred()];

  function* main(): Generator {
    actual.push(yield startDef);

    try {
      actual.push(yield* all([call(subroutine1), call(subroutine2)]));
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "cancelled");
      }
    }
  }

  function* subroutine1(): Generator {
    actual.push(yield "subroutine 1 start");

    try {
      actual.push(yield subroutineDefs[0]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "subroutine 1 cancelled");
      }
    }
  }

  function* subroutine2(): Generator {
    actual.push(yield "subroutine 2 start");

    try {
      actual.push(yield subroutineDefs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "subroutine 2 cancelled");
      }
    }
  }

  const task = run(main);

  cancelDef.then((v) => {
    actual.push(v);
    task.cancel(v as string);
  });

  Promise.resolve()
    .then(() => startDef.resolve("start"))
    .then(() => subroutineDefs[0]?.resolve("subroutine 1"))
    .then(() => delayP(10))
    .then(() => cancelDef.resolve("cancel"))
    .then(() => subroutineDefs[1]?.resolve("subroutine 2"));

  await task;

  const expected = [
    "start",
    "subroutine 1 start",
    "subroutine 2 start",
    "subroutine 1",
    "cancel",
    "subroutine 2 cancelled",
    "cancelled",
  ];

  t.deepEqual(
    actual,
    expected,
    "cancelled parallel effect must cancel all sub-effects",
  );
});

test("cancellation: automatic parallel effect cancellation", async (t) => {
  const actual: any[] = [];
  const subtask1Defs = [deferred(), deferred()];
  const subtask2Defs = [deferred(), deferred()];

  function* subtask1(): Generator {
    actual.push(yield subtask1Defs[0]);
    actual.push(yield subtask1Defs[1]);
  }

  function* subtask2(): Generator {
    try {
      actual.push(yield subtask2Defs[0]);
      actual.push(yield subtask2Defs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "subtask 2 cancelled");
      }
    }
  }

  function* genFn(): Generator {
    try {
      yield* all([call(subtask1), call(subtask2)]);
    } catch (e) {
      actual.push(yield `caught ${e}`);
    }
  }

  Promise.resolve()
    .then(() => subtask1Defs[0]?.resolve("subtask_1"))
    .then(() => subtask2Defs[0]?.resolve("subtask_2"))
    .then(() => delayP(10))
    .then(() => subtask1Defs[1]?.reject("subtask_1 rejection"))
    .then(() => delayP(10))
    .then(() => subtask2Defs[1]?.resolve("subtask_2_2"));

  const expected = [
    "subtask_1",
    "subtask_2",
    "subtask 2 cancelled",
    "caught subtask_1 rejection",
  ];

  await run(genFn);

  t.deepEqual(
    actual,
    expected,
    "must cancel parallel sub-effects on rejection",
  );
});

test("cancellation: automatic race competitor cancellation", async (t) => {
  const actual: any[] = [];
  const winnerSubtaskDefs = [deferred(), deferred()];
  const loserSubtaskDefs = [deferred(), deferred()];
  const parallelSubtaskDefs = [deferred(), deferred()];

  function* winnerSubtask(): Generator {
    try {
      actual.push(yield winnerSubtaskDefs[0]);
      actual.push(yield winnerSubtaskDefs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "winner subtask cancelled");
      }
    }
  }

  function* loserSubtask(): Generator {
    try {
      actual.push(yield loserSubtaskDefs[0]);
      actual.push(yield loserSubtaskDefs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "loser subtask cancelled");
      }
    }
  }

  function* parallelSubtask(): Generator {
    try {
      actual.push(yield parallelSubtaskDefs[0]);
      actual.push(yield parallelSubtaskDefs[1]);
    } finally {
      if (yield cancelled()) {
        actual.push(yield "parallel subtask cancelled");
      }
    }
  }

  function* genFn() {
    yield all([
      race({
        winner: call(winnerSubtask),
        loser: call(loserSubtask),
      }),
      call(parallelSubtask),
    ]);
  }

  Promise.resolve()
    .then(() => winnerSubtaskDefs[0]?.resolve("winner_1"))
    .then(() => loserSubtaskDefs[0]?.resolve("loser_1"))
    .then(() => parallelSubtaskDefs[0]?.resolve("parallel_1"))
    .then(() => winnerSubtaskDefs[1]?.resolve("winner_2"))
    .then(() => delayP(10))
    .then(() => loserSubtaskDefs[1]?.resolve("loser_2"))
    .then(() => parallelSubtaskDefs[1]?.resolve("parallel_2"));

  await run(genFn);

  const expected = [
    "winner_1",
    "loser_1",
    "parallel_1",
    "winner_2",
    "loser subtask cancelled",
    "parallel_2",
  ];
  t.deepEqual(
    actual,
    expected,
    "saga must cancel race competitors except for the winner",
  );
});

test("cancellation: manual task cancellation", async (t) => {
  const actual: any[] = [];
  const signIn = deferred();
  const signOut = deferred();
  const expires = [deferred(), deferred(), deferred()];

  function* subtask(): Generator {
    try {
      for (var i = 0; i < expires.length; i++) {
        actual.push(yield expires[i]);
      }
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "task cancelled");
      }
    }
  }

  function* genFn(): Generator {
    actual.push(yield signIn);
    const task = yield* fork(subtask);
    actual.push(yield signOut);
    yield* cancel(task);
  }

  Promise.resolve()
    .then(() => signIn.resolve("signIn"))
    .then(() => expires[0]?.resolve("expire_1"))
    .then(() => expires[1]?.resolve("expire_2"))
    .then(() => delayP(10))
    .then(() => signOut.resolve("signOut"))
    .then(() => delayP(50))
    .then(() => expires[2]?.resolve("expire_3"));

  await run(genFn);

  const expected = [
    "signIn",
    "expire_1",
    "expire_2",
    "signOut",
    "task cancelled",
  ];

  t.deepEqual(actual, expected, "must cancel forked tasks");
});

test("cancellation: nested task cancellation", async (t) => {
  const actual: any[] = [];
  const start = deferred();
  const stop = deferred();
  const subtaskDefs = [deferred(), deferred()];
  const nestedTask1Defs = [deferred(), deferred()];
  const nestedTask2Defs = [deferred(), deferred()];

  function* nestedTask1(): Generator {
    try {
      actual.push(yield nestedTask1Defs[0]);
      actual.push(yield nestedTask1Defs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "nested task 1 cancelled");
      }
    }
  }

  function* nestedTask2(): Generator {
    try {
      actual.push(yield nestedTask2Defs[0]);
      actual.push(yield nestedTask2Defs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "nested task 2 cancelled");
      }
    }
  }

  function* subtask(): Generator {
    try {
      actual.push(yield subtaskDefs[0]);
      yield* all([call(nestedTask1), call(nestedTask2)]);
      actual.push(yield subtaskDefs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "subtask cancelled");
      }
    }
  }

  function* genFn(): Generator {
    actual.push(yield start);
    const task = yield* fork(subtask);
    actual.push(yield stop);
    yield cancel(task);
  }

  Promise.resolve()
    .then(() => start.resolve("start"))
    .then(() => subtaskDefs[0]?.resolve("subtask_1"))
    .then(() => nestedTask1Defs[0]?.resolve("nested_task_1_1"))
    .then(() => nestedTask2Defs[0]?.resolve("nested_task_2_1"))
    .then(() => delayP(10))
    .then(() => stop.resolve("stop"))
    .then(() => delayP(10))
    .then(() => nestedTask1Defs[1]?.resolve("nested_task_1_2"))
    .then(() => nestedTask2Defs[1]?.resolve("nested_task_2_2"))
    .then(() => subtaskDefs[1]?.resolve("subtask_2"));

  await run(genFn);

  const expected = [
    "start",
    "subtask_1",
    "nested_task_1_1",
    "nested_task_2_1",
    "stop",
    "nested task 1 cancelled",
    "nested task 2 cancelled",
    "subtask cancelled",
  ];

  t.deepEqual(
    actual,
    expected,
    "must cancel forked task and its nested subtask",
  );
});

test("cancellation: nested forked task cancellation", async (t) => {
  const actual: any[] = [];
  const start = deferred();
  const stop = deferred();
  const subtaskDefs = [deferred(), deferred()];
  const nestedTaskDefs = [deferred(), deferred()];

  function* nestedTask(): Generator {
    try {
      actual.push(yield nestedTaskDefs[0]);
      actual.push(yield nestedTaskDefs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "nested task cancelled");
      }
    }
  }

  function* subtask(): Generator {
    try {
      actual.push(yield subtaskDefs[0]);
      yield* fork(nestedTask);
      actual.push(yield subtaskDefs[1]);
    } finally {
      if (yield* cancelled()) {
        actual.push(yield "subtask cancelled");
      }
    }
  }

  function* genFn(): Generator {
    actual.push(yield start);
    const task = yield* fork(subtask);
    actual.push(yield stop);
    yield cancel(task);
  }

  const task = run(genFn);

  Promise.resolve()
    .then(() => start.resolve("start"))
    .then(() => subtaskDefs[0]?.resolve("subtask_1"))
    .then(() => delayP(0))
    .then(() => nestedTaskDefs[0]?.resolve("nested_task_1"))
    .then(() => stop.resolve("stop")) //
    .then(() => delayP(0))
    .then(() => nestedTaskDefs[1]?.resolve("nested_task_2"))
    .then(() => subtaskDefs[1]?.resolve("subtask_2"));

  await task;

  const expected = [
    "start",
    "subtask_1",
    "nested_task_1",
    "stop",
    "subtask cancelled",
    "nested task cancelled",
  ];

  t.deepEqual(
    actual,
    expected,
    "must cancel forked task and its forked nested subtask",
  );
});

test("cancel should be able to cancel multiple tasks", async (t) => {
  const defs = [deferred(), deferred(), deferred()];
  const actual: any[] = [];

  function* worker(i: any) {
    try {
      yield defs[i];
    } finally {
      if (yield* cancelled()) {
        actual.push(i);
      }
    }
  }

  function* genFn(): Generator {
    const t1 = yield* fork(worker, 0);
    const t2 = yield* fork(worker, 1);
    const t3 = yield* fork(worker, 2);
    yield* cancel([t1, t2, t3]);
  }

  await run(genFn);
  const expected = [0, 1, 2];
  t.deepEqual(
    actual,
    expected,
    "it must be possible to cancel multiple tasks at once",
  );
});

test("cancel should support for self cancellation", async (t) => {
  const actual: any[] = [];

  function* worker() {
    try {
      yield cancel();
    } finally {
      if (yield* cancelled()) {
        actual.push("self cancellation");
      }
    }
  }

  function* genFn() {
    yield* fork(worker);
  }

  await run(genFn);
  const expected = ["self cancellation"];
  t.deepEqual(
    actual,
    expected,
    "it must be possible to trigger self cancellation",
  );
});

test("task should end in cancelled state when parent gets cancelled", async (t) => {
  let task: Task | null = null;

  function* child() {
    // just block
    yield new Promise(() => {});
  }

  function* parent() {
    task = yield* fork(child);
  }

  function* worker() {
    const parentTask = yield* fork(parent);
    yield* delay(0);
    yield cancel(parentTask);
  }

  await run(worker);

  if (!task) {
    t.fail();
    return;
  }

  t.true((task as Task).status() === "cancelled");
});
