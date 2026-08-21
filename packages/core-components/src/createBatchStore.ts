/**
 * Generic module-level batch store factory.
 *
 * Multiple hook instances (one per component) write to the same store keyed by
 * `accessToken`. A 50ms debounce collects all codes registered within the same
 * tick and produces a single immutable snapshot. `useSyncExternalStore` in the
 * consuming hook reacts to snapshot changes so all instances call the fetch
 * function with identical params — SWR then deduplicates to exactly one network
 * request.
 */

export const EMPTY: readonly string[] = Object.freeze([])

type StoreEntry = {
  skuCodes: Set<string>
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
        skuCodes: new Set(),
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
      entry.snapshot = Object.freeze(Array.from(entry.skuCodes))
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
    if (entry.skuCodes.has(code)) return
    entry.skuCodes.add(code)
    scheduleFlush(entry)
  }

  /** Unregister a code. Does not trigger a refetch — cached data remains. */
  function unregisterCode(accessToken: string, code: string): void {
    const entry = store.get(accessToken)
    if (entry == null) return
    entry.skuCodes.delete(code)
  }

  return { subscribe, getSnapshot, registerCode, unregisterCode, EMPTY }
}
