import type { BaseError } from "#typings/errors"

/**
 * Module-level store for the **Payment Gateway Handoff**, keyed by order id.
 *
 * A gateway component that has something to collect — a card, in practice —
 * registers here, and `<PlaceOrderButtonPaymentSessions>` asks it to collect
 * before placing the order. The two are *siblings* in a checkout, never
 * ancestor and descendant, so no React provider can sit above both. This is the
 * same problem `termsAcceptanceStore` solves, solved the same way, so the
 * library has one idiom rather than two.
 *
 * **Deliberately gateway-neutral.** The button asks whether *a* gateway has
 * registered, never which one. Teaching it to recognise setting types and the
 * shape of a particular gateway component is how
 * `PlaceOrderButtonPaymentSource` reached 598 lines; keeping the contract
 * anonymous is what keeps this branch readable.
 *
 * State lives in memory only. A reload starts empty, and that is correct: the
 * gateway has to remount and re-register before it can be asked for anything,
 * and whether the money was already taken is read from the order, not from here.
 *
 * `PaymentSource`-model gateways do **not** use this. They keep their existing
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
   * gateway's own word for it, e.g. Adyen's `resultCode`; never prose, because a
   * package cannot know the checkout's language and the API gives no message.
   *
   * The distinction from `unknown` decides whether a rollback is safe.
   */
  | { status: "failed"; code: string }
  /**
   * Something broke while collecting — a network failure, an expired gateway
   * session, an SDK error. The payment may or may not have gone through, so
   * **nothing may be rolled back**: refunding the gift cards here could take
   * back money for a card that did in fact charge, and the gateway's own webhook
   * may yet settle the order. Report it and leave everything alone.
   */
  | { status: "unknown"; code: string }

/**
 * Where a redirect return has got to.
 *
 * `resuming` and `resumed` exist because on that path nobody clicks anything:
 * the shopper comes back from a 3DS page with the money already taken, and the
 * order still has to be placed. The button watches this instead of a click.
 */
export type PaymentGatewayResumePhase = "idle" | "resuming" | "resumed" | "failed"

export interface PaymentGatewayHandoff {
  /** Ask the gateway to collect payment, or `null` when none has registered. */
  submit: (() => Promise<PaymentGatewaySubmitResult>) | null
  /**
   * Whether the gateway believes it could submit right now.
   *
   * Not what gates the place-order button — a button disabled with no
   * explanation is worse than a form that shows its own validation, and
   * subscribing to this across the seam would re-render the button on every
   * keystroke. Exposed so an application that wants that behaviour can build it.
   */
  isReady: boolean
  resumePhase: PaymentGatewayResumePhase
  /** Why a resume failed. Empty in every other phase. */
  resumeErrors: BaseError[]
}

interface Entry extends PaymentGatewayHandoff {
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
      submit: null,
      isReady: false,
      resumePhase: "idle",
      resumeErrors: NO_ERRORS,
      snapshot: {
        submit: null,
        isReady: false,
        resumePhase: "idle",
        resumeErrors: NO_ERRORS,
      },
    }
    entries.set(k, e)
  }
  return e
}

/**
 * Publish a new snapshot and wake subscribers.
 *
 * The snapshot is rebuilt here and nowhere else: `useSyncExternalStore` compares
 * snapshots by identity, so returning a fresh object per read would re-render
 * forever.
 */
function commit(orderId: string | null | undefined, e: Entry): void {
  e.snapshot = {
    submit: e.submit,
    isReady: e.isReady,
    resumePhase: e.resumePhase,
    resumeErrors: e.resumeErrors,
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

/**
 * Register a gateway's collect function. Returns the deregister function.
 *
 * Deregistering only clears what it registered. A gateway that remounts —
 * because the Payment Session was replaced after a refusal — registers the new
 * function before React runs the old cleanup, and a blind clear there would
 * leave the button with nothing to call.
 */
export function registerPaymentGateway(
  orderId: string | null | undefined,
  submit: () => Promise<PaymentGatewaySubmitResult>
): () => void {
  const e = entry(orderId)
  e.submit = submit
  commit(orderId, e)
  return () => {
    if (e.submit !== submit) return
    e.submit = null
    e.isReady = false
    commit(orderId, e)
  }
}

export function setPaymentGatewayReady(orderId: string | null | undefined, isReady: boolean): void {
  const e = entry(orderId)
  if (e.isReady === isReady) return
  e.isReady = isReady
  commit(orderId, e)
}

export function setPaymentGatewayResume(
  orderId: string | null | undefined,
  resumePhase: PaymentGatewayResumePhase,
  resumeErrors: BaseError[] = NO_ERRORS
): void {
  const e = entry(orderId)
  if (e.resumePhase === resumePhase && e.resumeErrors === resumeErrors) return
  e.resumePhase = resumePhase
  e.resumeErrors = resumeErrors
  commit(orderId, e)
}

/** Test-only: drops all state so specs cannot leak a handoff into each other. */
export function resetPaymentGatewayStore(): void {
  entries.clear()
  listeners.clear()
}
