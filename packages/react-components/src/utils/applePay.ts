/**
 * Apple Pay's browser globals, looked up rather than referenced.
 *
 * Both are Safari's own and absent from the DOM lib. Looked up **when needed**
 * and not at module load: a module-scope read would fix the answer before
 * hydration, and would make the globals untestable without a load-order trick.
 */

type ApplePayErrorConstructor = new (
  code: string,
  contactField?: string,
  message?: string
) => ApplePayJS.ApplePayError

/** Apple's error type, if we are in a browser that has one. */
export function applePayErrorCtor(): ApplePayErrorConstructor | undefined {
  return (globalThis as { ApplePayError?: ApplePayErrorConstructor }).ApplePayError
}

/** Apple's session class, if we are in a browser that has one. */
export function applePaySessionCtor(): typeof ApplePaySession | undefined {
  return (globalThis as { ApplePaySession?: typeof ApplePaySession }).ApplePaySession
}

/**
 * An `ApplePayError` carrying our message, for a payment sheet to show.
 *
 * Apple takes an `ApplePayError`, and a string is not one — passed a string,
 * `completePayment` shows its own generic failure instead. `unknown` is the only
 * code that is not about a contact field.
 *
 * Whether Safari renders our message or its own wording for that code is not
 * something the DOM contract promises, so this is written to be *correct*
 * rather than to guarantee the copy. `undefined` where the global is missing:
 * a browser with no such global never rendered an Apple Pay button in the
 * first place, so that branch is unreachable rather than a degraded one.
 */
export function applePayError(message: string): ApplePayJS.ApplePayError | undefined {
  const Ctor = applePayErrorCtor()
  return Ctor != null ? new Ctor("unknown", undefined, message) : undefined
}
