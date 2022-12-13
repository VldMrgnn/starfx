import type { Fn } from "./types.js";
import type { Task } from "./task.js";

export interface Scheduler {
  exec(fn: () => Task): Task;
  asap(fn: Fn): void;
  immediately(fn: () => Task | void): Task;
  suspend(): void;
  release(): void;
  flush(): void;
}

/**
 * A counting sempahore
 * https://en.wikipedia.org/wiki/Semaphore_(programming)#Semaphores_vs._mutexes

 * - Incrementing adds a lock and puts the scheduler in a `suspended` state (if it's not
 *   already suspended)
 * - Decrementing releases a lock. Zero locks puts the scheduler in a `released` state. This
 *   triggers flushing the queued tasks.
 */
export function createScheduler(): Scheduler {
  const queue: (() => Task)[] = [];
  let semaphore = 0;

  /**
    Executes a task 'atomically'. Tasks scheduled during this execution will be queued
    and flushed after this task has finished (assuming the scheduler endup in a released
    state).
  */
  function exec(task: () => Task) {
    try {
      suspend();
      return task();
    } finally {
      release();
    }
  }

  /**
    Executes or queues a task depending on the state of the scheduler (`suspended` or `released`)
  */
  function asap(task: () => Task) {
    queue.push(task);

    if (!semaphore) {
      suspend();
      flush();
    }
  }

  /**
    Puts the scheduler in a `suspended` state and executes a task immediately.
  */
  function immediately(task: () => Task) {
    try {
      suspend();
      return task();
    } finally {
      flush();
    }
  }

  /**
    Puts the scheduler in a `suspended` state. Scheduled tasks will be queued until the
    scheduler is released.
  */
  function suspend() {
    semaphore += 1;
  }

  /**
    Puts the scheduler in a `released` state.
  */
  function release() {
    semaphore -= 1;
  }

  /**
    Releases the current lock. Executes all queued tasks if the scheduler is in the released state.
  */
  function flush() {
    release();

    let task: (() => Task) | undefined;
    while (!semaphore && (task = queue.shift()) !== undefined) {
      exec(task);
    }
  }

  return {
    exec,
    asap,
    immediately,
    suspend,
    release,
    flush,
  };
}
