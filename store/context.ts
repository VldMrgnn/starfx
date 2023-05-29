import { AnyAction, Channel, createChannel, createContext } from "../deps.ts";

import type { FxStore } from "./types.ts";

export const ActionContext = createContext<Channel<AnyAction, void>>(
  "action",
  createChannel<AnyAction, void>(),
);

export const StoreUpdateContext = createContext<Channel<void, void>>(
  "action",
  createChannel<void, void>(),
);

export const StoreContext = createContext<FxStore<unknown>>("store");
