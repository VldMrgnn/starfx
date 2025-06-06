import type { Callable, Operation, Task } from "effection";
import { action, call, resource, spawn } from "effection";

interface OpMap<T = unknown> {
  [key: string]: Callable<T>;
}

export function raceMap<T>(opMap: OpMap): Operation<{
  [K in keyof OpMap<T>]: OpMap[K] extends (...args: any[]) => any
    ? ReturnType<OpMap[K]>
    : OpMap[K];
}> {
  return resource(function* Race(provide) {
    const keys = Object.keys(opMap);
    const taskMap: { [key: string]: Task<unknown> } = {};
    const resultMap: { [key: keyof OpMap]: OpMap[keyof OpMap] } = {};

    const winner = yield* action<Task<unknown>>(function* (resolve) {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        yield* spawn(function* () {
          const task = yield* spawn(function* () {
            yield* call(opMap[key] as any);
          });
          taskMap[key] = task;
          (resultMap as any)[key] = yield* task;
          resolve(task);
        });
      }
    });

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const task = taskMap[key];
      if (task === winner) {
        continue;
      }

      yield* spawn(() => task.halt());
    }

    yield* provide(resultMap);
  });
}
