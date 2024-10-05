import type { AnyAction } from "../types.ts";
import type { Signal } from "../deps.ts";
import IdemWeakMapIterable from "./weakMap-iterable.ts";

interface SignalInfo {
  storeId: string;
  thunkIds: string[];
}

export function createSignalMap() {
  const signalStoreMap = IdemWeakMapIterable<
    Signal<AnyAction, void>,
    SignalInfo
  >();

  return {
    addSignal(signal: Signal<AnyAction, void>, storeId: string) {
      const signalInfo = signalStoreMap.get(signal) ??
        { storeId, thunkIds: [] };
      signalStoreMap.set(signal, { ...signalInfo, storeId });
    },

    getStoreId(signal: Signal<AnyAction, void>): string | undefined {
      return signalStoreMap.get(signal)?.storeId;
    },

    registerThunkOnSignal(signal: Signal<AnyAction, void>, thunkId: string) {
      const signalInfo = signalStoreMap.get(signal);
      if (signalInfo && !signalInfo.thunkIds.includes(thunkId)) {
        signalInfo.thunkIds.push(thunkId);
        signalStoreMap.set(signal, signalInfo);
      }
    },

    getSignalsByThunk(thunkId: string): Signal<AnyAction, void>[] {
      const matchingSignals: Signal<AnyAction, void>[] = [];
      signalStoreMap.keys().forEach((signal) => {
        const signalInfo = signalStoreMap.get(signal);
        if (signalInfo?.thunkIds.includes(thunkId)) {
          matchingSignals.push(signal);
        }
      });
      return matchingSignals;
    },

    removeSignal(signal: Signal<AnyAction, void>) {
      signalStoreMap.delete(signal);
    },

    isThunkRegisteredOnSignal(
      signal: Signal<AnyAction, void>,
      thunkId: string,
    ): boolean {
      return signalStoreMap.get(signal)?.thunkIds.includes(thunkId) ?? false;
    },

    removeThunkOverall(thunkId: string) {
      signalStoreMap.keys().forEach((signal) => {
        const signalInfo = signalStoreMap.get(signal);
        if (signalInfo) {
          signalInfo.thunkIds = signalInfo.thunkIds.filter((id) =>
            id !== thunkId
          );
          signalStoreMap.set(signal, signalInfo);
        }
      });
    },
  };
}
