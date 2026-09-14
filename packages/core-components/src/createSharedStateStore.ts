/**
 * Module-level shared state store factory.
 *
 * `createBatchStore` solves "sibling instances must agree on what to fetch".
 * This factory solves the other half: sibling instances must agree on state
 * that never reaches the API — form values being typed, which payment method
 * is currently selected, a place-order status, validation errors.
 *
 * React context cannot carry that state when the components sit in sibling
 * subtrees, because context only flows down. A module-level store does, and
 * `useSyncExternalStore` in the consuming hook keeps every instance in sync
 * regardless of where it sits in the tree.
 *
 * Two deliberate differences from `createBatchStore`:
 *
 * - **No debounce.** Batching exists to collapse network requests; UI state
 *   must propagate on the same tick it changes.
 * - **Entries outlive their subscribers.** A stepped checkout unmounts and
 *   remounts whole subtrees as the customer moves between steps. Dropping the
 *   entry with the last subscriber would evaporate half-typed form values on
 *   every step change. Entries are keyed by access token, so a new session
 *   never reads a previous one's state.
 *
 * @internal Not part of the public API. Consumers use the hooks in
 * `@commercelayer/react-hooks-components`.
 */

type StoreEntry<T> = {
  /** Immutable snapshot consumed by `useSyncExternalStore`. */
  snapshot: Readonly<T>
  listeners: Set<() => void>
}

export interface SharedStateStore<T extends object> {
   /**
   * Build the store key. An order id scopes the state to that order; without
   * one the state is scoped to the access token alone, which is what an
   * address book editing a customer's saved addresses needs — there is no
   * order there, but the form and the button that saves it still have to agree.
   *
   * Returns `null` when not even an access token is available, mirroring the
   * `null` SWR key idiom: a `null` key means "inert".
   */
  buildKey: (params: {
    accessToken?: string | null
    orderId?: string | null
    /** Isolates a second, independent state for the same order. */
    scope?: string
  }) => string | null
  /** Subscribe to state changes for a key. Returns an unsubscribe fn. */
  subscribe: (key: string | null, listener: () => void) => () => void
  /** Current immutable snapshot. Reference is stable until the state changes. */
  getSnapshot: (key: string | null) => Readonly<T>
  /** Snapshot used during SSR and hydration: always the initial state. */
  getServerSnapshot: () => Readonly<T>
  /** Shallow-merge a patch into the state and notify subscribers. */
  setState: (
    key: string | null,
    patch: Partial<T> | ((previous: Readonly<T>) => Partial<T>)
  ) => void
  /** Drop a key's state, back to the initial snapshot. */
  reset: (key: string | null) => void
  /** Drop every key. Meant for test isolation, since entries are long-lived. */
  clear: () => void
}

export function createSharedStateStore<T extends object>(
  initialState: T
): SharedStateStore<T> {
  const initialSnapshot: Readonly<T> = Object.freeze({ ...initialState })
  const store = new Map<string, StoreEntry<T>>()

  function getOrCreate(key: string): StoreEntry<T> {
    let entry = store.get(key)
    if (entry == null) {
      entry = { snapshot: initialSnapshot, listeners: new Set() }
      store.set(key, entry)
    }
    return entry
  }

  function buildKey({
    accessToken,
    orderId,
    scope,
  }: {
    accessToken?: string | null
    orderId?: string | null
    scope?: string
  }): string | null {
    if (!accessToken) return null
    const base = `${accessToken}:${orderId ?? "no-order"}`
    return scope ? `${base}:${scope}` : base
  }

  function subscribe(key: string | null, listener: () => void): () => void {
    if (key == null) return () => {}
    const entry = getOrCreate(key)
    entry.listeners.add(listener)
    return () => {
      entry.listeners.delete(listener)
      // The entry itself is kept on purpose: subtrees unmount between checkout
      // steps and must find their state again on the way back.
    }
  }

  function getSnapshot(key: string | null): Readonly<T> {
    if (key == null) return initialSnapshot
    return store.get(key)?.snapshot ?? initialSnapshot
  }

  function getServerSnapshot(): Readonly<T> {
    return initialSnapshot
  }

  function setState(
    key: string | null,
    patch: Partial<T> | ((previous: Readonly<T>) => Partial<T>)
  ): void {
    if (key == null) return
    const entry = getOrCreate(key)
    const previous = entry.snapshot
    const changes = typeof patch === "function" ? patch(previous) : patch

    // Bail out when nothing actually changed. `useSyncExternalStore` compares
    // snapshots by identity and re-renders on every new reference, so handing
    // back an equal-but-new object would loop.
    let changed = false
    for (const field of Object.keys(changes) as Array<keyof T>) {
      if (!Object.is(previous[field], changes[field])) {
        changed = true
        break
      }
    }
    if (!changed) return

    entry.snapshot = Object.freeze({ ...previous, ...changes })
    for (const listener of entry.listeners) listener()
  }

  function reset(key: string | null): void {
    if (key == null) return
    const entry = store.get(key)
    if (entry == null || entry.snapshot === initialSnapshot) return
    entry.snapshot = initialSnapshot
    for (const listener of entry.listeners) listener()
  }

  function clear(): void {
    for (const key of Array.from(store.keys())) reset(key)
    store.clear()
  }

  return { buildKey, subscribe, getSnapshot, getServerSnapshot, setState, reset, clear }
}
