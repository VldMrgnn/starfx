import type { AnyAction } from "./types.ts";
import type { Signal } from "./deps.ts";

interface SignalInfo {
  storeId: string;
  thunkIds: string[];
}

const signalStoreMap = new Map<Signal<AnyAction, void>, SignalInfo>();

export function createSignalMap() {
  return {
    addSignal(signal: Signal<AnyAction, void>, storeId: string) {
      const existingSignal = signalStoreMap.get(signal);
      if (existingSignal && existingSignal.storeId === storeId) {
        return;
      }
      if (existingSignal) {
        existingSignal.storeId = storeId;
      } else {
        signalStoreMap.set(signal, { storeId, thunkIds: [] });
      }
    },

    getStoreId(signal: Signal<AnyAction, void>): string | undefined {
      const signalInfo = signalStoreMap.get(signal);
      return signalInfo?.storeId;
    },

    registerThunkOnSignal(signal: Signal<AnyAction, void>, thunkId: string) {
      const signalInfo = signalStoreMap.get(signal);
      if (signalInfo && !signalInfo.thunkIds.includes(thunkId)) {
        signalInfo.thunkIds.push(thunkId);
      }
    },

    getSignalsByThunk(thunkId: string): Signal<AnyAction, void>[] {
      const matchingSignals: Signal<AnyAction, void>[] = [];
      for (const [signal, signalInfo] of signalStoreMap) {
        if (signalInfo.thunkIds.includes(thunkId)) {
          matchingSignals.push(signal);
        }
      }
      return matchingSignals;
    },

    removeSignal(signal: Signal<AnyAction, void>) {
      signalStoreMap.delete(signal);
    },

    isThunkRegisteredOnSignal(
      signal: Signal<AnyAction, void>,
      thunkId: string,
    ): boolean {
      const signalInfo = signalStoreMap.get(signal);
      return signalInfo?.thunkIds.includes(thunkId) ?? false;
    },

    removeThunkOverall(thunkId: string) {
      for (const [, signalInfo] of signalStoreMap) {
        signalInfo.thunkIds = signalInfo.thunkIds.filter((id) =>
          id !== thunkId
        );
      }
    },
  };
}
