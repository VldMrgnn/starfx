import { Operation, run, expect} from "../deps.ts";
import { take, updateStore } from "../store/mod.ts";
import { match, P } from "../deps.ts";
import { mapReducers } from "../deps.ts";

import { StoreContext } from "../store/mod.ts";
import { QueryState } from "../types.ts";
import { FxStore } from "../store/types.ts";



type TInitState = ReturnType<typeof StoreContext.get>;
export type RootState = QueryState & TInitState & FxStore<TInitState>;

const setSuffix = "/set";
const resetSuffix = "/reset";
const addSuffix = "/add";
const removeSuffix = "/remove";
const patchSuffix = "/patch";
const mergeSuffix = "/merge";
const starfxPrefix = "@@starfx/";


export function ensureArray(ar: any[] | any) {
  return Array.isArray(ar) ? ar : [ar].filter((f) => f !== undefined);
}

export function setSlice<K extends keyof RootState>(
  key: K,
  value: RootState[K]
) {
  return function (state: RootState) {
    state[key] = value as (typeof state)[K];
  };
}


function* sxnext(action: any) {
  
const store = yield* StoreContext.get();
if (!store) {
    throw new Error("Store is not initialized");
}
  const storeKeys = Object.keys(store.initialState);
  const setRegexPattern = new RegExp(
    `^${starfxPrefix}(${storeKeys.join("|")})${setSuffix}$`
  );
  const resetRegexPattern = new RegExp(
    `^${starfxPrefix}(${storeKeys.join("|")})${resetSuffix}$`
  );
  const addRegexPattern = new RegExp(
    `^${starfxPrefix}(${storeKeys.join("|")})${addSuffix}$`
  );
  const removeRegexPattern = new RegExp(
    `^${starfxPrefix}(${storeKeys.join("|")})${removeSuffix}$`
  );
  const patchRegexPattern = new RegExp(
    `^${starfxPrefix}(${storeKeys.join("|")})${patchSuffix}$`
  );
  const mergeRegexPattern = new RegExp(
    `^${starfxPrefix}(${storeKeys.join("|")})${mergeSuffix}$`
  );

  console.log("sxnext", action);
  return match(action)
    .with(
      { type: P.string.regex(setRegexPattern), payload: P.any },
      ({ type, payload }) => {
        const sliceName = type.replace(setRegexPattern, "$1");
        store.run(function* () {
          yield* updateStore(setSlice(sliceName as keyof RootState, payload  as Partial<RootState[keyof RootState]>));
        });
      }
    )
    .with({ type: P.string.regex(resetRegexPattern) }, ({ type }) => {
      const sliceName = type.replace(resetRegexPattern, "$1");
      store.run(function* () {
        yield* updateStore(
          setSlice(sliceName as keyof RootState, store.initialState[sliceName])
        );
      });
    })
    .with(
      { type: P.string.regex(addRegexPattern), payload: P.any },
      ({ type, payload }) => {
        const sliceName = type.replace(addRegexPattern, "$1");
        const current = store.getState()[sliceName];
        const newState = mapReducers().add(current,  payload as {[key: string]: Partial<RootState[keyof RootState]>} );
        store.run(function* () {
          yield* updateStore(setSlice(sliceName as keyof RootState, newState));
        });
      }
    )
    .with(
      { type: P.string.regex(removeRegexPattern), payload: P.any },
      ({ type, payload }) => {
        const sliceName = type.replace(removeRegexPattern, "$1");
		const current = store.getState()[sliceName];
		const arrPayload = ensureArray(payload);
        const newState = mapReducers().remove(current, arrPayload);
        store.run(function* () {
          yield* updateStore(setSlice(sliceName as keyof RootState, newState));
        });
      }
    )
    .with(
      { type: P.string.regex(patchRegexPattern), payload: P.any },
      ({ type, payload }) => {
        const sliceName = type.replace(patchRegexPattern, "$1");
		const current = store.getState()[sliceName];
		const newState = mapReducers().patch(current, payload as {[key: string] : Partial<RootState[keyof RootState]>});
        store.run(function* () {
          yield* updateStore(setSlice(sliceName as keyof RootState, newState));
        });
      }
    )
    .with(
      { type: P.string.regex(mergeRegexPattern), payload: P.any },
      ({ type, payload }) => {
        const sliceName = type.replace(mergeRegexPattern, "$1");
		const current = store.getState()[sliceName];
		const newState = mapReducers().merge(current, payload as {[key: string]: Partial<RootState[keyof RootState]>});
        store.run(function* () {
		  yield* updateStore(setSlice(sliceName as keyof RootState, newState));
        });
      }
    )
    .otherwise(() => {
      console.log("NOT A PREDEFINED ACTION:", action);
    });
}
export function* starduxTakeEvery() {
  while (true) {
    const next = yield* take("*");
    yield* sxnext(next);
  }
}
