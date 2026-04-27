/**
 * Module-level batch store for SKU codes.
 *
 * Multiple `useSkus` hook instances (one per `<Sku>` component) write to
 * the same store keyed by `accessToken`. A 50ms debounce collects all codes
 * registered within the same tick and produces a single immutable snapshot.
 * `useSyncExternalStore` in `useSkus` reacts to snapshot changes so all
 * instances call `fetchSkus` with identical params — SWR then deduplicates
 * to exactly one network request.
 */

import { EMPTY as _EMPTY, createBatchStore } from "@commercelayer/core"

const _store = createBatchStore()

export const EMPTY: readonly string[] = _EMPTY
export const subscribe = _store.subscribe
export const getSnapshot = _store.getSnapshot
export const registerSku = _store.registerCode
export const unregisterSku = _store.unregisterCode
