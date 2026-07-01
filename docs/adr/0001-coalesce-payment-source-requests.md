# Coalesce concurrent payment-source requests

## Context

`setPaymentSource` (in `PaymentMethodReducer.ts`) is a plain async function driven by React effects — notably the `PaymentGateway` effect, which fires it fire-and-forget from a 23-dependency effect. Before the first `create`/`update`/`updateOrder` request resolves, both `paymentSource` (context state) and `order.payment_source` are still null, so any dependency change re-runs the effect and fires a **second** request. On the Stripe / single-payment-method / new-source flow this produced two `stripe_payments.create` calls and two payment source records.

## Decision

De-duplicate genuinely-concurrent calls with a module-level `Map<string, Promise>` keyed by `` `${order.id}:${paymentResource}:${customerPaymentSourceId ?? paymentSourceId ?? 'create'}` ``. The first call stores its in-flight promise; concurrent calls with the same key return that same promise; the entry is deleted in a `finally` once it settles. This coalesces duplicates within a burst without permanently memoizing, so a later legitimate re-create still runs. It backs up the narrower in-flight `useRef` guard in the `PaymentGateway` effect and protects every gateway, not just Stripe.

## Considered options

- **Effect-only `useRef` guard** — kept as the first line of defense, but too narrow: only protects the `PaymentGateway` caller, not other gateways or future callers.
- **Idempotency check against `order.payment_source`** — unreliable: the order is stale until `getOrder` refreshes after the first request.
- **Hashing `attributes` into the key** — rejected as fragile; attributes are effectively constant for a given order + resource + path within a burst.

## Consequences

The reducer module now holds mutable global state, which reads as surprising for an otherwise-stateless function — this ADR is the "why." The key deliberately separates the create, update/retrieve, and saved-source (`updateOrder`) paths so coalescing never merges semantically different operations.
