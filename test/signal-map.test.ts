import { createSignalMap } from "../controller/signal-map.ts";
import { createSignal } from "../deps.ts";
import { asserts, describe, it } from "../test.ts";

import type { Signal } from "../deps.ts";
import type { AnyAction } from "../types.ts";

const tests = describe("signal-map");

it(tests, "createSignalMap - addSignal and getStoreId", () => {
  const signalMap = createSignalMap();
  const signal: Signal<AnyAction, void> = createSignal<AnyAction, void>();
  const storeId = "store1";

  signalMap.addSignal(signal, storeId);
  const retrievedStoreId = signalMap.getStoreId(signal);

  asserts.assertEquals(
    retrievedStoreId,
    storeId,
    "The storeId should be retrievable after adding the signal",
  );
});

it(
  tests,
  "createSignalMap - registerThunkOnSignal and isThunkRegisteredOnSignal",
  () => {
    const signalMap = createSignalMap();
    const signal: Signal<AnyAction, void> = createSignal<AnyAction, void>();
    const storeId = "store1";
    const thunkId = "thunk1";

    signalMap.addSignal(signal, storeId);
    signalMap.registerThunkOnSignal(signal, thunkId);

    const isRegistered = signalMap.isThunkRegisteredOnSignal(signal, thunkId);
    asserts.assert(
      isRegistered,
      "The thunkId should be registered on the signal",
    );
  },
);

it(tests, "createSignalMap - getSignalsByThunk", () => {
  const signalMap = createSignalMap();
  const signal1: Signal<AnyAction, void> = createSignal<AnyAction, void>();
  const signal2: Signal<AnyAction, void> = createSignal<AnyAction, void>();

  const storeId1 = "store1";
  const storeId2 = "store2";
  const thunkId = "thunk1";
  signalMap.addSignal(signal1, storeId1);
  signalMap.addSignal(signal2, storeId2);
  signalMap.registerThunkOnSignal(signal1, thunkId);
  signalMap.registerThunkOnSignal(signal2, thunkId);

  const signals = signalMap.getSignalsByThunk(thunkId);

  asserts.assertEquals(
    signals.length,
    2,
    "There should be two signals registered with the thunkId",
  );
  asserts.assert(
    signals.includes(signal1),
    "Signal1 should be in the list of signals",
  );
  asserts.assert(
    signals.includes(signal2),
    "Signal2 should be in the list of signals",
  );
});

it(tests, "createSignalMap - removeSignal", () => {
  const signalMap = createSignalMap();
  const signal: Signal<AnyAction, void> = createSignal<AnyAction, void>();
  const storeId = "store1";

  signalMap.addSignal(signal, storeId);
  signalMap.removeSignal(signal);

  const retrievedStoreId = signalMap.getStoreId(signal);
  asserts.assertEquals(
    retrievedStoreId,
    undefined,
    "The storeId should be undefined after removing the signal",
  );
});

it(tests, "createSignalMap - removeThunkOverall", () => {
  const signalMap = createSignalMap();
  const signal1: Signal<AnyAction, void> = createSignal<AnyAction, void>();
  const signal2: Signal<AnyAction, void> = createSignal<AnyAction, void>();
  const storeId1 = "store1";
  const storeId2 = "store2";
  const thunkId = "thunk1";

  signalMap.addSignal(signal1, storeId1);
  signalMap.addSignal(signal2, storeId2);
  signalMap.registerThunkOnSignal(signal1, thunkId);
  signalMap.registerThunkOnSignal(signal2, thunkId);

  signalMap.removeThunkOverall(thunkId);

  const isRegistered1 = signalMap.isThunkRegisteredOnSignal(signal1, thunkId);
  const isRegistered2 = signalMap.isThunkRegisteredOnSignal(signal2, thunkId);

  asserts.assertFalse(
    isRegistered1,
    "The thunkId should be removed from signal1",
  );
  asserts.assertFalse(
    isRegistered2,
    "The thunkId should be removed from signal2",
  );
});
