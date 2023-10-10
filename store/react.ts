import { useQuery } from "../query/react.ts";
import { useSelector } from "../deps.ts";
import type { LoaderState } from "../types.ts";
import type { AnyState } from "../types.ts";
type ActionFn<P = any> = (p: P) => { toString: () => string };
interface SagaAction<P = any> {
  type: string;
  payload: { key: string; options: P };
}
interface UseApiAction<A extends SagaAction = SagaAction>
  extends LoaderState {
  trigger: () => void;
  action: A;
}

interface UseCacheResult<D = any, A extends SagaAction = SagaAction>
  extends UseApiAction<A> {
  data: D | null;
}
function selectStoreLoaderById<S extends AnyState>(
	  state: S,
  { id }: { id: string },
) {
  return state["loaders"]?.[id] || null;
}

function selectStoreDataById<S extends AnyState>(
  state: S,
  { id }: { id: string },
) {
  return state["data"][id];
}

/**
 * useLoader will take an action creator or action itself and return the associated
 * loader for it.
 *
 * @returns the loader object for an action creator or action
 *
 * @example
 * ```ts
 * import { useLoader } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const fetchUsers = api.get('/users', function*() {
 *   // ...
 * });
 *
 * const View = () => {
 *   const loader = useLoader(fetchUsers);
 *   // or: const loader = useLoader(fetchUsers());
 *   return <div>{loader.isLoader ? 'Loading ...' : 'Done!'}</div>
 * }
 * ```
 */
export function useLoader<S extends AnyState>(
	action: SagaAction | ActionFn,
  ) {
	const id = typeof action === "function" ? `${action}` : action.payload.key;
	return useSelector((s: S) => selectStoreLoaderById(s, { id }));
  }


/**
 * useCache uses {@link useQuery} and automatically selects the cached data associated
 * with the action creator or action provided.
 *
 * @example
 * ```ts
 * import { useCache } from 'saga-query/react';
 *
 * import { api } from './api';
 *
 * const fetchUsers = api.get('/users', api.cache());
 *
 * const View = () => {
 *   const { isLoading, data } = useCache(fetchUsers());
 *   return <div>{isLoading ? : 'Loading' : data.length}</div>
 * }
 * ```
 */
export function useCache<D = any, A extends SagaAction = SagaAction>(
	action: A,
  ): UseCacheResult<D, A> {
	const id = action.payload.key;
	const data: any = useSelector((s: any) => selectStoreDataById(s, { id }));
	const query = useQuery(action);
	return { ...query, data: data || null };
  }
  
