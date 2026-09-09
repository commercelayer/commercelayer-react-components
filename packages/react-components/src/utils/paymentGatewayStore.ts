import type { BaseError } from "#typings/errors"

/**
 * Module-level store for the **Payment Gateway Handoff**, keyed by order id.
 *
 * It is how a **Payment Gateway** component and `<PlaceOrderButton>` reach each
 * other. The two are *siblings* in a checkout, never ancestor and descendant,
 * so in standalone mode no React provider can sit above both — the same problem
 * `termsAcceptanceStore` solves, solved the same way, so the library has one
 * idiom rather than two.
 *
 * State lives in memory only. A reload starts empty, and that is correct: a
 * gateway has to remount and re-register before it can be asked for anything,
 * and whether money was already taken is read from the order, not from here.
 *
 * `payment_source`-model gateways do **not** use this. They keep their existing
 * `PlaceOrderContext` ref channel, which stays exclusive to that model.
 */

/** What asking a gateway to collect payment can produce. */
export type PaymentGatewaySubmitResult =
  /** Money taken. The place sequence can run. */
  | { status: "completed" }
  /**
   * The shopper has not finished — an empty or invalid form. The gateway has
   * shown its own validation, so there is nothing for the caller to report:
   * this is a stop, not a failure.
   */
  | { status: "incomplete" }
  /**
   * The gateway refused — a **verdict**, so no money moved. `code` is the
   * gateway's own word for it, e.g. Adyen's `resultCode`; never prose, because
   * a package cannot know the checkout's language and the API gives no message.
   *
   * The distinction from `unknown` decides whether a rollback is safe.
   */
  | { status: "failed"; code: string }
  /**
   * Something broke while collecting — a network failure, an expired gateway
   * session, a cancelled overlay. The payment may or may not have gone through,
   * so **nothing may be rolled back**: giving the gift cards back here could
   * take money for a card that did in fact charge, and the gateway's own
   * webhook may yet settle the order. Report it and leave everything alone.
   */
  | { status: "unknown"; code: string }

/**
 * Who will collect the payment for this order.
 *
 * The distinction exists because it is a property of the **payment method**,
 * not of this library. A card form is inert until something submits it, so the
 * host's own button can be the pay button — which is what keeps the
 * privacy-and-terms gate in front of every payment. A method with a
 * **Gateway-Owned Button** cannot be collected that way: PayPal's `submit`
 * throws by design, because a popup needs a real user gesture on their branded
 * button. For those the gate moves inside the method's own click, and the
 * host's button has nothing to do but say so.
 */
export type PaymentCollection =
  /** The host's control collects, by calling `submit`. */
  | {
      by: "host"
      submit: () => Promise<PaymentGatewaySubmitResult>
      /**
       * Whether the gateway believes it could submit right now.
       *
       * Not what gates the place-order button — a button disabled with no
       * explanation is worse than a form that shows its own validation, and
       * subscribing to this across the seam would re-render the button on every
       * keystroke. Exposed so an application that wants that can build it.
       */
      isReady: boolean
    }
  /** The method's own control collects. The host cannot. */
  | { by: "gateway" }

/**
 * Whether a payment has been collected without the shopper pressing the
 * checkout's place-order button — an **Out-of-Band Collection**.
 *
 * Two things produce it and they are one mechanism: returning from a 3DS
 * redirect, where the page reloaded and nobody clicked anything, and a
 * **Gateway-Owned Button**, where the click was never ours. Both leave the
 * order still to be placed, and both are paths where the library places it on
 * its own initiative — the only ones.
 */
export type OutOfBandCollection = "no" | "in-progress" | "done" | "failed"

export interface PaymentGatewayHandoff {
  /**
   * How this order's payment will be collected, or `null` when nothing needs
   * collecting — a manual payment, or gift cards covering the order outright.
   */
  collection: PaymentCollection | null
  collectedOutOfBand: OutOfBandCollection
  /** Why an out-of-band collection failed. Empty in every other phase. */
  errors: BaseError[]
}

interface Entry extends PaymentGatewayHandoff {
  /**
   * Identity of the current registration.
   *
   * Deregistering must only clear what it registered: a gateway that remounts —
   * because its Payment Session was replaced after a refusal — registers again
   * before React runs the old cleanup, and a blind clear there would leave the
   * button with nothing to call. Compared as an object rather than by the
   * `submit` function, because `setCollectionReady` rebuilds the collection.
   */
  token: object | null
  /** Cached snapshot, so `useSyncExternalStore` compares by reference safely. */
  snapshot: PaymentGatewayHandoff
}

/** Key used before the order has loaded, so gateway and button still agree. */
const PENDING_ORDER_KEY = "__cl_no_order__"

const NO_ERRORS: BaseError[] = []

const entries = new Map<string, Entry>()
const listeners = new Map<string, Set<() => void>>()

function key(orderId?: string | null): string {
  return orderId ?? PENDING_ORDER_KEY
}

function entry(orderId?: string | null): Entry {
  const k = key(orderId)
  let e = entries.get(k)
  if (e == null) {
    e = {
      token: null,
      collection: null,
      collectedOutOfBand: "no",
      errors: NO_ERRORS,
      snapshot: { collection: null, collectedOutOfBand: "no", errors: NO_ERRORS },
    }
    entries.set(k, e)
  }
  return e
}

/**
 * Publish a new snapshot and wake subscribers.
 *
 * The snapshot is rebuilt here and nowhere else: `useSyncExternalStore`
 * compares snapshots by identity, so returning a fresh object per read would
 * re-render forever.
 */
function commit(orderId: string | null | undefined, e: Entry): void {
  e.snapshot = {
    collection: e.collection,
    collectedOutOfBand: e.collectedOutOfBand,
    errors: e.errors,
  }
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

export function getHandoffSnapshot(orderId?: string | null): PaymentGatewayHandoff {
  return entry(orderId).snapshot
}

function register(orderId: string | null | undefined, collection: PaymentCollection): () => void {
  const e = entry(orderId)
  const token = {}
  e.token = token
  e.collection = collection
  commit(orderId, e)
  return () => {
    if (e.token !== token) return
    e.token = null
    e.collection = null
    commit(orderId, e)
  }
}

/**
 * Register a gateway the host's own button will collect through.
 *
 * Returns the deregister function.
 */
export function registerHostCollection(
  orderId: string | null | undefined,
  submit: () => Promise<PaymentGatewaySubmitResult>
): () => void {
  return register(orderId, { by: "host", submit, isReady: false })
}

/**
 * Register a gateway that collects through its own control.
 *
 * The host's button cannot call anything for these, and telling it so is the
 * whole point: it disables itself with this as the reason rather than offering
 * a second route to one action, where its own route leads nowhere.
 */
export function registerGatewayCollection(orderId: string | null | undefined): () => void {
  return register(orderId, { by: "gateway" })
}

/** Meaningless unless the current collection is the host's; ignored otherwise. */
export function setCollectionReady(orderId: string | null | undefined, isReady: boolean): void {
  const e = entry(orderId)
  if (e.collection?.by !== "host") return
  if (e.collection.isReady === isReady) return
  e.collection = { ...e.collection, isReady }
  commit(orderId, e)
}

export function setOutOfBandCollection(
  orderId: string | null | undefined,
  collectedOutOfBand: OutOfBandCollection,
  errors: BaseError[] = NO_ERRORS
): void {
  const e = entry(orderId)
  if (e.collectedOutOfBand === collectedOutOfBand && e.errors === errors) return
  e.collectedOutOfBand = collectedOutOfBand
  e.errors = errors
  commit(orderId, e)
}

/** Test-only: drops all state so specs cannot leak a handoff into each other. */
export function resetPaymentGatewayStore(): void {
  entries.clear()
  listeners.clear()
}
