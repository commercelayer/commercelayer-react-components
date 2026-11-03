import type { PaymentSession } from "@commercelayer/sdk"
import { useRef } from "react"

/**
 * A value read out of a Payment Session, remembered across a refetch that
 * arrives without it.
 *
 * Gateways boot from something in `response_data` — Stripe's client secret,
 * Braintree's client token — and `response_data` is not in every consumer's
 * `fields` allowlist. A checkout that refetches the order for its own reasons —
 * after a gift card, say — can hand a gateway component a copy of the *same
 * session* with the value missing. Read literally that means "no session", the
 * gateway's form unmounts, and the card the shopper was halfway through typing
 * is gone. It cost a test that looked like a mistyped card number: only the
 * first keystroke had survived.
 *
 * So a value is kept until the **session** changes, which is the only thing
 * that actually invalidates it. A different session id drops it, because then
 * the old value belongs to a payment that is no longer the selection.
 */
export function useStickySessionValue(
  session: PaymentSession | undefined,
  read: (session?: PaymentSession) => string | undefined
): string | undefined {
  const sessionId = session?.id
  const remembered = useRef<{ sessionId?: string; value?: string }>({})
  const value = read(session)

  // Written during render on purpose: this is a cache of a value derived from
  // the props, not state anything renders from, and an effect would leave one
  // render showing no form at all — which is the unmount this exists to avoid.
  if (value != null) remembered.current = { sessionId, value }
  else if (remembered.current.sessionId !== sessionId) remembered.current = {}

  return value ?? remembered.current.value
}
