import type { SharedStateStore } from "@commercelayer/core-components"
import { type Dispatch, useCallback, useId, useMemo, useSyncExternalStore } from "react"

/**
 * A reducer whose state lives in a module-level store instead of in React.
 *
 * `useReducer` keeps its state inside the component that calls it, which is
 * exactly the problem: components that need to agree on this state are
 * siblings, so neither React state nor context can carry it between them. This
 * hook keeps the same reducer and the same actions, and only moves where the
 * state is held — every instance working on the same order reads and writes one
 * state, wherever it sits in the tree.
 *
 * Without an access token there is nobody to share with, so the state falls
 * back to a key private to this instance rather than being dropped.
 */
export function useSharedReducer<S extends object, A>(
  store: SharedStateStore<S>,
  reducer: (state: S, action: A) => S,
  { accessToken, orderId }: { accessToken?: string | null; orderId?: string | null }
): [S, Dispatch<A>] {
  const instanceId = useId()
  const key = useMemo(
    () => store.buildKey({ accessToken, orderId }) ?? `local:${instanceId}`,
    [store, accessToken, orderId, instanceId]
  )

  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(key, listener),
    [store, key]
  )
  const getSnapshot = useCallback(() => store.getSnapshot(key), [store, key])
  const state = useSyncExternalStore(subscribe, getSnapshot, store.getServerSnapshot)

  const dispatch = useCallback<Dispatch<A>>(
    (action) => {
      // The reducer returns the whole next state; the store merges it field by
      // field and keeps the previous snapshot when nothing actually changed.
      store.setState(key, (previous) => reducer(previous as S, action))
    },
    [store, key, reducer]
  )

  return [state, dispatch]
}
