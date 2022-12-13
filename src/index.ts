// why no promises for runtime:
// - https://github.com/redux-saga/redux-saga/issues/16#issuecomment-175119425
// - https://github.com/redux-saga/redux-saga/issues/50#issuecomment-174475389
// why scheduler:
// - https://github.com/redux-saga/redux-saga/pull/622
// issue: yield call inside large for-loop causes crash:
// - https://github.com/redux-saga/redux-saga/issues/1592
import { stdChannel } from "./channel.js";
import { createTask } from "./task.js";
import type { Channel } from "./channel.js";
import { createIdCreator } from "./util.js";

export * from "./fx/index.js";
export * from "./task.js";
export * from "./operation.js";
export { delayP, symbols, deferred } from "./util.js";
export * from "./channel.js";
export { Action } from "./types.js";

interface RunProps {
  channel?: Channel;
}

export function createRuntime({ channel }: RunProps = {}) {
  if (!channel) {
    channel = stdChannel();
  }
  const createId = createIdCreator();

  function driver<Fn extends (...args: any[]) => any = (...args: any[]) => any>(
    fn: Fn,
    ...args: Parameters<Fn>
  ) {
    const task = createTask(fn(...args), {
      createId,
      channel: channel as Channel,
      labels: { name: "root" },
    });
    task.start();
    return task;
  }

  return driver;
}

export const run = createRuntime();
