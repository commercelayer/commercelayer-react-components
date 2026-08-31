/**
 * Module-level store for privacy & terms acceptance, keyed by order id.
 *
 * `<PrivacyAndTermsCheckbox>` is a *sibling* of `<PlaceOrderButton>`, never its
 * ancestor, so in standalone mode no React provider can sit above both. This
 * store is the shared channel between them: the checkbox writes acceptance,
 * `PlaceOrderContainer` / `usePlaceOrder` subscribe via `useSyncExternalStore`
 * and recompute `isPermitted` as soon as it changes.
 *
 * State lives in memory only — it is deliberately *not* persisted. A reload
 * starts from "not accepted", so what the shopper sees and what gates the
 * button can never diverge.
 *
 * Keying by order id keeps acceptance given on one order from leaking into
 * another, and lets two independent checkouts coexist on the same page.
 */

interface Entry {
  accepted: boolean
  /** How many `<PrivacyAndTermsCheckbox>` instances are currently mounted. */
  checkboxCount: number
}

/** Key used before the order has loaded, so checkbox and button still agree. */
const PENDING_ORDER_KEY = "__cl_no_order__"

const entries = new Map<string, Entry>()
const listeners = new Map<string, Set<() => void>>()

function key(orderId?: string | null): string {
  return orderId ?? PENDING_ORDER_KEY
}

function entry(orderId?: string | null): Entry {
  const k = key(orderId)
  let e = entries.get(k)
  if (e == null) {
    e = { accepted: false, checkboxCount: 0 }
    entries.set(k, e)
  }
  return e
}

function emit(orderId?: string | null): void {
  const set = listeners.get(key(orderId))
  if (set == null) return
  for (const listener of set) listener()
}

export function subscribe(orderId: string | null | undefined, listener: () => void): () => void {
  const k = key(orderId)
  let set = listeners.get(k)
  if (set == null) {
    set = new Set()
    listeners.set(k, set)
  }
  set.add(listener)
  return () => {
    set?.delete(listener)
    if (set?.size === 0) listeners.delete(k)
  }
}

/**
 * Current acceptance for an order. A boolean, so `useSyncExternalStore`
 * compares snapshots by value and never loops.
 */
export function getAcceptedSnapshot(orderId?: string | null): boolean {
  return entry(orderId).accepted
}

export function setAccepted(orderId: string | null | undefined, accepted: boolean): void {
  const e = entry(orderId)
  if (e.accepted === accepted) return
  e.accepted = accepted
  emit(orderId)
}

/** How many checkboxes are mounted for this order. Used only for diagnostics. */
export function getCheckboxCount(orderId?: string | null): number {
  return entry(orderId).checkboxCount
}

/**
 * Registers a mounted checkbox. Returns the deregister function.
 *
 * When the last checkbox for an order unmounts, acceptance is reset: consent
 * must not outlive the control that collected it.
 */
export function registerCheckbox(orderId?: string | null): () => void {
  const e = entry(orderId)
  e.checkboxCount += 1
  emit(orderId)
  return () => {
    e.checkboxCount = Math.max(0, e.checkboxCount - 1)
    if (e.checkboxCount === 0) e.accepted = false
    emit(orderId)
  }
}

/** Test-only: drops all state so specs cannot leak acceptance into each other. */
export function resetTermsAcceptanceStore(): void {
  entries.clear()
  listeners.clear()
}
