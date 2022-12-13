const prefix = "@@fx";
export const symbols = {
  prefix,
  io: `${prefix}/io`,
  match: `${prefix}/match`,
  cancel: `${prefix}/cancel`,
  terminate: `${prefix}/terminate`,
  end: `${prefix}/channel_end`,
  selfCancellation: `${prefix}/self_cancellation`,
};

export const noop = () => {};

export function check<T = any>(
  value: T,
  predicate: (v: T) => boolean,
  error: string,
) {
  if (!predicate(value)) {
    throw new Error(error);
  }
}

export function remove<E = any>(array: E[], item: E) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export function once(fn: () => void) {
  let called = false;
  return () => {
    if (called) {
      return;
    }
    called = true;
    fn();
  };
}

export function createIdCreator() {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
}

export interface Deferred<T = any> extends Promise<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  name: string;
}

export function deferred<T>(name: string = ""): Deferred<T> {
  const ret: Partial<Deferred<T>> = { name };
  const promise = new Promise<T>((resolve, reject) => {
    ret.resolve = resolve;
    ret.reject = reject;
  });
  ret.then = (...args) => promise.then(...args);
  ret.catch = (...args) => promise.catch(...args);
  ret.finally = (...args) => promise.finally(...args);

  return ret as Deferred<T>;
}

const MAX_SIGNED_INT = 2147483647;

export function delayP(ms: number, val = true) {
  // https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value
  if (process.env["NODE_ENV"] !== "production" && ms > MAX_SIGNED_INT) {
    throw new Error(
      `delay only supports a maximum value of ${MAX_SIGNED_INT}ms`,
    );
  }
  let timeoutId: any;
  const promise = new Promise((resolve) => {
    timeoutId = setTimeout(resolve, Math.min(MAX_SIGNED_INT, ms), val);
  });

  const cancel = () => clearTimeout(timeoutId);
  (promise as any).cancel = cancel;

  return promise;
}

export const createEmptyArray = (n = 0) => Array.apply(null, new Array(n));
export const shouldTerminate = (res: string) => res === symbols.terminate;
export const shouldCancel = (res: string) => res === symbols.cancel;
export const shouldComplete = (res: string) =>
  shouldTerminate(res) || shouldCancel(res);
