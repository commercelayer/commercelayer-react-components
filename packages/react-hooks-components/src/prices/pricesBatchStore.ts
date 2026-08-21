/**
 * Module-level batch store for price SKU codes.
 *
 * Multiple `usePrices` hook instances (one per `<Price>` component) write to
 * the same store keyed by `accessToken`. A 50ms debounce collects all codes
 * registered within the same tick and produces a single immutable snapshot.
 * `useSyncExternalStore` in `usePrices` reacts to snapshot changes so all
 * instances call `fetchPrices` with identical params — SWR then deduplicates
 * to exactly one network request.
 */

import { EMPTY as _EMPTY, createBatchStore } from "@commercelayer/core-components"

const _store = createBatchStore()

export const EMPTY: readonly string[] = _EMPTY
export const subscribe = _store.subscribe
export const getSnapshot = _store.getSnapshot
export const registerSku = _store.registerCode
export const unregisterSku = _store.unregisterCode
