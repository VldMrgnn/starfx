import type { Operation } from "./operation.js";
import type { Labels, NextProps } from "./types.js";
import type { Channel } from "./channel.js";
import { deferred } from "./util.js";
import { createEmitter } from "./emitter.js";
import type { Listener } from "./emitter.js";
import { createController } from "./controller.js";

interface TaskOptions<ParentOut = any> {
  channel: Channel;
  createId: () => number;
  createdBy?: Task<ParentOut> | undefined;
  labels?: Labels;
}

export type TaskStatus =
  | "pending"
  | "running"
  | "cancelled"
  | "done"
  | "aborted";

export interface Task<TOut = unknown, ParentOut = unknown>
  extends Promise<TOut> {
  readonly id: number;
  readonly status: () => TaskStatus;
  readonly labels: Labels;
  readonly children: () => Task[];
  readonly channel: Channel;
  readonly createId: () => number;
  readonly operation: Operation<TOut>;
  readonly createdBy?: Task<ParentOut> | undefined;
  create: <ChildOut>(value: Operation<ChildOut>) => Task<ChildOut>;
  cancel: (reason: string) => void;
  abort: (reason: string) => void;
  start: () => void;
  finished: (next: NextProps) => void;
  once: (lsn: Listener) => void;
  emit: (props: NextProps) => void;
  link: <ChildOut>(child: Task<ChildOut>) => void;
}

interface StateMachine {
  state: () => TaskStatus;
  set: (next: TaskStatus) => void;
}

function createStateMachine(): StateMachine {
  let current: TaskStatus = "pending";
  function set(next: TaskStatus) {
    current = next;
  }
  return { state: () => current, set };
}

export const createTask = <TOut, ParentOut = unknown>(
  operation: Operation<TOut>,
  { channel, createId, createdBy, labels = {} }: TaskOptions<ParentOut>,
): Task<TOut> => {
  let result: NextProps = { value: undefined, state: "pending" };
  const { scheduler } = channel;
  const promise = deferred<TOut>();
  const stm = createStateMachine();
  const id = createId();
  const emitter = createEmitter();
  const children: Set<Task> = new Set();

  const task: Task<TOut> = {
    id,
    labels,
    channel,
    start,
    cancel,
    createId,
    finished,
    abort,
    link,
    create,
    createdBy,
    operation,
    children: () => [...children],
    status: () => stm.state(),
    then: (...args) => promise.then(...args),
    catch: (...args) => promise.catch(...args),
    finally: (...args) => promise.finally(...args),
    once: (...args) => emitter.once(...args),
    emit: (...args) => emitter.emit(...args),
    [Symbol.toStringTag]: `[Task ${id}]`,
  };

  function create<ChildOut>(value: Operation<ChildOut>) {
    return createTask<ChildOut>(value, {
      channel,
      createId,
      createdBy: task,
    });
  }

  function finished(props: NextProps) {
    const isStackOverflow =
      props.value instanceof Error &&
      props.value?.message === "Maximum call stack size exceeded";

    if (isStackOverflow) {
      emitter.emit({ value: props.value, state: "aborted" });
      shutdown("done");
      promise.reject(props.value);
      return;
    }

    result = props;
    if (children.size !== 0) {
      return;
    }
    if (task.status() === "done" || props.state === "pending") {
      return;
    }

    if (task.status() !== "cancelled" && task.status() !== "aborted") {
      stm.set("done");
    }
    emitter.emit(props);
    shutdown("done");

    if (props.state === "aborted") {
      promise.reject(props.value);
    } else {
      promise.resolve(props.value);
    }
  }

  function cancel(reason: string) {
    if (task.status() !== "running") {
      return;
    }

    stm.set("cancelled");
    controller.cancel(reason);
    shutdown(reason);
  }

  function shutdown(reason: string) {
    let nextChild: Task | undefined;
    function cancelChild() {
      nextChild = Array.from(task.children())
        .reverse()
        .find((c) => c !== nextChild);
      if (nextChild) {
        nextChild.once(cancelChild);
        nextChild.cancel(reason);
      }
    }
    cancelChild();
  }

  function abort(reason: string) {
    stm.set("aborted");
    console.log(`${task.id} aborted: ${reason}`);
  }

  function link(child: Task) {
    if (children.has(child)) {
      return;
    }

    child.once((props) => {
      if (task.status() === "done") {
        return;
      }

      if (props.state === "errored") {
        task.cancel(props.value);
      }

      if (children.has(child)) {
        children.delete(child);
      }

      finished(result);
    });

    children.add(child);
  }

  const controller = createController(task, operation);

  function start() {
    return scheduler.immediately(() => {
      if (stm.state() !== "pending") {
        throw new Error(
          `Task ${id} cannot be started because it is in ${stm.state()} state`,
        );
      }

      stm.set("running");
      controller.start();
    });
  }

  return task;
};
