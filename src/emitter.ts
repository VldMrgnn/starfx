import type { NextProps } from "./types.js";

export interface Listener {
  (props: NextProps): void;
}

export interface Emitter {
  once: (lsn: Listener) => void;
  emit: (props: NextProps) => void;
}

/**
 * A very simple callback emitter.
 *
 *  - It's goal is to allow callbacks to be registered via `once`.
 *  - Then something can `emit` a value which we pass to all listeners
 *  - Then we remove all the listeners
 *  - Repeat
 */
export function createEmitter(): Emitter {
  let result: NextProps;
  let listeners: Listener[] = [];
  const loop = () => {
    if (!result) {
      return;
    }
    while (true) {
      const sendTo = listeners.shift();
      if (sendTo) {
        sendTo(result);
      } else {
        break;
      }
    }
  };
  const once = (lsn: Listener) => {
    listeners.push(lsn);
    loop();
  };
  const emit = (props: NextProps) => {
    if (result) {
      return;
    }
    result = props;
    loop();
  };
  return { once, emit };
}
