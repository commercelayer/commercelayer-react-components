import type { Address, Order, PaymentSession } from "@commercelayer/sdk"
import type {
  ThreeDSecure,
  ThreeDSecureBillingAddress,
  ThreeDSecureVerifyOptions,
  ThreeDSecureVerifyPayload,
} from "braintree-web/three-d-secure"

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

type VerifyCardOptions = ThreeDSecureVerifyOptions & {
  onLookupComplete: (data: unknown, next: () => void) => void
}

/**
 * Run 3DS on a card nonce, for the session's amount, and resolve with the
 * verified payload. Rejects with Braintree's error when 3DS itself fails; a
 * shopper who did not authenticate resolves, and `liabilityRefusal` decides.
 */
export function verifyCard(
  threeDSecure: ThreeDSecure,
  {
    nonce,
    bin,
    session,
    order,
  }: { nonce: string; bin: string; session: PaymentSession; order?: Order | null }
): Promise<ThreeDSecureVerifyPayload> {
  const options: VerifyCardOptions = {
    nonce,
    bin,
    amount: sessionAmount(session),
    // Both optional, and both raise the share of shoppers who authenticate
    // without a challenge.
    email: order?.customer_email ?? undefined,
    billingAddress: threeDSecureBillingAddress(order),
    collectDeviceData: true,
    // Required by 3DS v2, which pauses after the issuer lookup until this
    // calls `next` — and missing from the typings.
    onLookupComplete: (_data, next) => {
      next()
    },
  }
  // The typings declare the promise-returning overload as `void`.
  return threeDSecure.verifyCard(options) as unknown as Promise<ThreeDSecureVerifyPayload>
}

/**
 * Why the 3DS outcome refuses the payment, or `undefined` when it does not.
 *
 * Commerce Layer authorizes a nonce whatever its 3DS outcome — it sends no 3DS
 * parameter and checks no liability shift — so this is the only place the
 * outcome is enforced.
 */
export function liabilityRefusal(
  verified: ThreeDSecureVerifyPayload,
  requireLiabilityShift: boolean
): string | undefined {
  const info = verified.threeDSecureInfo
  if (info.liabilityShifted) return undefined
  // Possible and not shifted: the shopper failed or abandoned the challenge.
  if (info.liabilityShiftPossible || requireLiabilityShift) {
    return (info as { status?: string }).status ?? "liability_not_shifted"
  }
  return undefined
}

/** The order's billing address, as 3DS names its parts. */
function threeDSecureBillingAddress(order?: Order | null): ThreeDSecureBillingAddress | undefined {
  const address: Address | null | undefined = order?.billing_address
  if (address == null) return undefined
  return {
    givenName: address.first_name ?? undefined,
    surname: address.last_name ?? undefined,
    phoneNumber: address.phone ?? undefined,
    streetAddress: address.line_1 ?? undefined,
    extendedAddress: address.line_2 ?? undefined,
    locality: address.city ?? undefined,
    region: address.state_code ?? undefined,
    postalCode: address.zip_code ?? undefined,
    countryCodeAlpha2: address.country_code ?? undefined,
  }
}
