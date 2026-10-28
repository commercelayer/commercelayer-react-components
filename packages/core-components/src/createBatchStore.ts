/**
 * Generic module-level batch store factory.
 *
 * Multiple hook instances (one per component) write to the same store keyed by
 * `accessToken`. A 50ms debounce collects all codes registered within the same
 * tick and produces a single immutable snapshot. `useSyncExternalStore` in the
 * consuming hook reacts to snapshot changes so all instances call the fetch
 * function with identical params — SWR then deduplicates to exactly one network
 * request.
 *
 * Every flush rebuilds the snapshot from all registered codes, so a component
 * mounted later refetches the whole batch, not only its own code.
 */

import type { ListResponse, Resource } from "@commercelayer/sdk"

export const EMPTY: readonly string[] = Object.freeze([])

/** Maximum page size accepted by the Commerce Layer API. */
export const BATCH_PAGE_SIZE = 25

type StoreEntry = {
  /** Registered codes, with the number of consumers currently holding each one. */
  codes: Map<string, number>
  timer: ReturnType<typeof setTimeout> | null
  /** Immutable snapshot consumed by `useSyncExternalStore`. */
  snapshot: readonly string[]
  listeners: Set<() => void>
}

export function createBatchStore() {
  const store = new Map<string, StoreEntry>()

  function getOrCreate(accessToken: string): StoreEntry {
    let entry = store.get(accessToken)
    if (entry == null) {
      entry = {
        codes: new Map(),
        timer: null,
        snapshot: EMPTY,
        listeners: new Set(),
      }
      store.set(accessToken, entry)
    }
    return entry
  }

  function scheduleFlush(entry: StoreEntry): void {
    if (entry.timer != null) clearTimeout(entry.timer)
    entry.timer = setTimeout(() => {
      entry.snapshot = Object.freeze(Array.from(entry.codes.keys()))
      entry.timer = null
      for (const listener of entry.listeners) listener()
    }, 50)
  }

  /** Subscribe to snapshot changes for the given access token. Returns an unsubscribe fn. */
  function subscribe(accessToken: string, listener: () => void): () => void {
    const entry = getOrCreate(accessToken)
    entry.listeners.add(listener)
    return () => {
      entry.listeners.delete(listener)
      // Clean up store entry once all hook instances unmount
      if (entry.listeners.size === 0) {
        if (entry.timer != null) clearTimeout(entry.timer)
        store.delete(accessToken)
      }
    }
  }

  /** Returns the current immutable snapshot (stable reference until next flush). */
  function getSnapshot(accessToken: string): readonly string[] {
    return store.get(accessToken)?.snapshot ?? EMPTY
  }

  /** Register a code. Schedules a debounced flush that notifies all subscribers. */
  function registerCode(accessToken: string, code: string): void {
    if (!accessToken) return
    const entry = getOrCreate(accessToken)
    const count = entry.codes.get(code) ?? 0
    entry.codes.set(code, count + 1)
    if (count > 0) return
    scheduleFlush(entry)
  }

  /**
   * Unregister a code. The code leaves the next batch only when its last
   * consumer unregisters. Does not trigger a refetch — cached data remains.
   */
  function unregisterCode(accessToken: string, code: string): void {
    const entry = store.get(accessToken)
    if (entry == null) return
    const count = entry.codes.get(code)
    if (count == null) return
    if (count > 1) entry.codes.set(code, count - 1)
    else entry.codes.delete(code)
  }

  return { subscribe, getSnapshot, registerCode, unregisterCode, EMPTY }
}

/**
 * Fetches a batch of codes in chunks of `BATCH_PAGE_SIZE`, in parallel, and
 * merges the results. A single list request returns at most one page, so a
 * batch wider than one page would otherwise be truncated silently.
 */
export async function fetchInChunks<T extends Resource>(
  codes: readonly string[],
  fetchChunk: (codes: string[], pageSize: typeof BATCH_PAGE_SIZE) => Promise<ListResponse<T> | T[]>
): Promise<T[]> {
  const chunks: string[][] = []
  for (let i = 0; i < codes.length; i += BATCH_PAGE_SIZE) {
    chunks.push(codes.slice(i, i + BATCH_PAGE_SIZE))
  }
  const responses = await Promise.all(chunks.map((chunk) => fetchChunk(chunk, BATCH_PAGE_SIZE)))
  for (const response of responses) {
    // More records than codes (e.g. several prices per SKU) can still overflow a page
    if ("meta" in response && response.meta.pageCount > 1) {
      console.warn(
        `[createBatchStore] a batch request returned ${response.meta.recordCount} records but only the first ${BATCH_PAGE_SIZE} were loaded.`
      )
    }
  }
  return responses.flat()
}
