import { AnyAction, React } from "./deps.ts";
const { createContext, createElement: h, useContext } = React;
import type { Operation, Scope } from "./deps.ts";
import { put } from "./store.test.ts";

export * from "./query/react.ts";

const ScopeContext = createContext<Scope | null>(null);

export function Provider({
  scope,
  children,
}: {
  scope: Scope;
  children: React.ReactNode;
}) {
  return h(ScopeContext.Provider, { value: scope }, children);
}

export function useScope(): Scope {
  const scope = useContext(ScopeContext);
  if (!scope) {
    throw new Error("scope is null");
  }
  return scope;
}

/**
 * This hook dispatches actions directly to the Action channel we use
 * for redux.  This makes it so you don't have to dispatch a redux action
 * in order to trigger an fx.
 */
export function useFxDispatch() {
  const scope = useScope();
  return (action: AnyAction | AnyAction[]) =>
    scope.run(function* () {
      yield* put(action);
    });
}

export function useFx<T>(op: () => Operation<T>) {
  const scope = useScope();
  return scope.run(op);
}
