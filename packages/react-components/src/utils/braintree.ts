import type { PaymentSession } from "@commercelayer/sdk"
import type { ThreeDSecure } from "braintree-web/three-d-secure"

/**
 * braintree-web ships CommonJS, so a dynamic `import()` of one of its subpaths
 * resolves to a namespace whose `default` holds `module.exports` under some
 * bundlers and whose members are hoisted under others. Normalise both shapes.
 */
// biome-ignore lint/suspicious/noExplicitAny: braintree-web subpaths are untyped CJS namespaces
export function interopDefault(mod: any): any {
  return mod?.default ?? mod
}

/** Braintree's error code, from one of its `BraintreeError`s. */
export function braintreeErrorCode(error: unknown): string | undefined {
  if (error == null || typeof error !== "object") return undefined
  const code = (error as { code?: unknown }).code
  return typeof code === "string" && code !== "" ? code : undefined
}

/**
 * What this session pays, as the major-unit string Braintree's browser modules
 * ask for — 3DS's `amount`, Apple Pay's `total.amount`.
 *
 * The **session's** amount, not the order's: with gift cards applied the card
 * pays only the remainder, and showing or authenticating a different sum from
 * the one charged is exactly what the shopper and the issuer are there to
 * notice. `amount_float` is Commerce Layer's own major-unit figure, so no
 * currency's decimals have to be guessed here; `amount_cents` is the fallback
 * for a consumer whose `fields` allowlist leaves it out.
 */
export function sessionAmount(session: PaymentSession): string {
  const amount = session.amount_float ?? (session.amount_cents ?? 0) / 100
  return amount.toFixed(2)
}

let pageThreeDSecure: Promise<ThreeDSecure> | null = null

/**
 * The page's 3DS instance: created by the first caller, handed to every later
 * one, and never torn down.
 *
 * One per page because Cardinal, which 3DS runs on, can be set up only once per
 * page. A second instance configures it again and asks it to set up again, and
 * Cardinal neither repeats its setup nor tells the new instance that it already
 * happened — so the new instance waits for a device-data reference that never
 * comes, and its first payment hangs on "placing". A card form that replaces
 * another — the save-card box ticked, a session renewed, the shopper coming
 * back to the card — is exactly that second instance.
 *
 * Kept for the same reason it is never torn down: tearing it down removes its
 * Cardinal listeners, and nothing could set them up again. The instance stays
 * bound to the client it was created with, which is fine for a card form
 * replacing another: the lookup is the same merchant's, and the nonce it
 * verifies is the new form's.
 *
 * A creation that fails is forgotten, so the next form tries again.
 */
export function pageThreeDSecureInstance(
  create: () => Promise<ThreeDSecure>
): Promise<ThreeDSecure> {
  if (pageThreeDSecure == null) {
    const created = create()
    pageThreeDSecure = created
    created.catch(() => {
      if (pageThreeDSecure === created) pageThreeDSecure = null
    })
  }
  return pageThreeDSecure
}

/** Forget the page's 3DS instance. For tests, which share the module. */
export function resetPageThreeDSecure(): void {
  pageThreeDSecure = null
}
