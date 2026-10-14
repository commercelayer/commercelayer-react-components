import type { PaymentSession } from "@commercelayer/sdk"

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
