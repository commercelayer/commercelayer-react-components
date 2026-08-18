# React Components — Payment

This context covers the React components and state that let a storefront pay for an order during checkout, under either Payments Model.

## Language

**Payments Model**:
Which of the two mutually exclusive payment models an order uses. Two values, named after the order relationship that carries the payment: **`payment_source`** (the older model: `payment_gateways` + `payment_methods` + a per-gateway payment source) and **`payment_sessions`** (the newer model: `payment_settings` + `payment_sessions`). An order is bound to one model for its whole life; it can never switch. A third transient value, `undetermined`, means the order data needed to decide has not loaded yet.
The API version and the Payments Model are two different things: the version says what the API *can* express (`available_payment_settings` exists only from `2026-05`), the order says which model it *uses*. API version `2026-05` is backward compatible and serves both models, so two organizations on the same version can be on different Payments Models, and a single response can carry both `available_payment_methods` and `available_payment_settings`.
_Avoid_: legacy vs new (ages badly), payments version (collides with the API version, e.g. `2026-05`), v1/v2

**Payment Method**:
A selectable payment option on an order (a configured gateway option, e.g. "Stripe"). Backed by the `payment_method` resource. Belongs to the `payment_source` Payments Model only.
_Avoid_: gateway (as a synonym), payment type

**Payment Source**:
The concrete payment instrument record attached to a single order (e.g. `stripe_payment`, `adyen_payment`, `wire_transfer`). Created per order from the selected Payment Method. Belongs to the `payment_source` Payments Model only.
_Avoid_: payment, card, token

**Payment Setting**:
A configured payment gateway (Stripe, Adyen, Manual, Gift Card, …) at the organization/market level, modelled per-provider (`payment_setting_manuals`, `payment_setting_stripes`, …). The `payment_sessions`-model counterpart of a Payment Method + Payment Gateway pair. An order lists the ones it can use in `available_payment_settings`.
_Avoid_: payment gateway, payment method

**Payment Session**:
One intended payment against an order, for an `amount_cents`, through a Payment Setting. The `payment_sessions`-model counterpart of a Payment Source. Its lifecycle is Payment Session → Payment Authorization → Payment Capture (→ Payment Refund). An order can carry several sessions (split payment) — unlike a Payment Source, of which there is at most one. `amount_cents` is set once and never updated; omit it on create and the server sizes the session to the order's remaining amount, while an explicit value is silently capped to it. Its `status` is one of seven values (`unpaid`, `authorized`, `voided`, `paid`, `partially_paid`, `refunded`, `partially_refunded`) and only the middle three count as payment taken.
_Avoid_: payment source, charge, payment intent

**Payment Authorization**:
The record proving a Payment Session's money was actually taken. A session is only a stated *intent* to pay; a session with a `succeeded` Payment Authorization is the one and only evidence of payment on the `payment_sessions` model. Also what makes the order placeable.
_Avoid_: authorized session, payment (as a synonym for the session)

**Current Payment Session**:
The Payment Session the shopper's selection points at — the one whose Payment Setting is the selected one and whose `amount_cents` still equals the order total. It is the shopper's choice made durable: the order has no `payment_setting` relationship, so the selection is read back as `order.payment_sessions[].payment_setting`. Browser state is a rendering cache of it, never the authority.
_Avoid_: pending session, selected payment method

**Placeable**:
Whether the API would accept placing the order. Two distinct things share the word: `order.placeable` and the `_placeable` trigger — but they are **not** two ways to ask the same question, and only one of them is usable. `order.placeable` is transient and served **only in an update response**, never on a `GET`, so it can never gate a button on render. The `_placeable` trigger is a `PATCH` that *validates* the order: 200 with the whole order on success, 422 with a JSON:API `errors` array on failure. Because a failed validation persists nothing, repeating it is cheap. Payment coverage is checked by a default payment rule whose threshold an organization can change — so placeability is a server judgement, never a client calculation.
_Avoid_: "can be placed" (ambiguous between the attribute and the check), validated

**Reusable Session**:
A Payment Session the library may adopt instead of creating a new one: same Payment Setting, `status` still `unpaid`, not past `expires_at`, and with no Payment Authorization in a terminal failure state. Anything failing that predicate is abandoned in place, not deleted — an `unpaid` session counts toward nothing, and a sales-channel token may be refused the delete anyway.
_Avoid_: pending session, stale session, orphan session (the last one is what an abandoned session *becomes*)

**Undetermined**:
The window in which the order has not yet been loaded with the relationship needed to tell the Payments Model apart, so neither payment tree may be mounted. It is an observable state that every consumer must render something for — not a transient detail that can be ignored.
_Avoid_: loading (the order may well be loaded; what is missing is the include), unknown

**Customer Payment Source**:
A Payment Source saved to a Customer for reuse across orders (a stored card). Selected via the order's `_customer_payment_source_id`.
_Avoid_: saved card (informal), wallet

**Payment Gateway**:
In this codebase, the React component that wires a specific gateway's UI/SDK and drives Payment Source creation for that gateway (e.g. `StripeGateway`, `AdyenGateway`).
_Avoid_: using "gateway" to mean the Payment Method

## Relationships

- An **Order** is on exactly one **Payments Model**, permanently
- On the `payment_source` model: an **Order** has at most one **Payment Method** and one **Payment Source**; the Payment Source is created from the selected Payment Method
- On the `payment_sessions` model: an **Order** has zero or more **Payment Sessions**, each created from one **Payment Setting**
- There is no `order.payment_setting`: the selected **Payment Setting** is reachable only through `order.payment_sessions[].payment_setting`
- A **Payment Session** has at most one **Payment Authorization**; a session without one has taken no money, and one whose authorization failed stays `unpaid` and is abandoned rather than deleted
- A **Payment Session** only counts toward the order's paid amount once its **Payment Authorization** has succeeded — and for a manual Payment Setting that happens in a background job, so it is never immediate
- An **Order** on the `payment_sessions` model can still carry `available_payment_methods`: API version `2026-05` is additive, and the new model simply takes precedence
- A **Customer Payment Source** belongs to a **Customer**; selecting one sets the **Order**'s Payment Source

## Example dialogue

> **Dev:** "When the shopper picks Stripe, do we create the **Payment Source** in the `StripePayment` component?"
> **Domain expert:** "No — Stripe has no dedicated creation component. The `StripeGateway`/`PaymentGateway` effect creates the **Payment Source** once the **Payment Method** is selected. Adyen and Braintree, by contrast, create it inside their own components."

> **Dev:** "So on the `payment_sessions` model, `<PaymentGateway>` picks the manual component instead?"
> **Domain expert:** "No. `<PaymentGateway>` only exists on the `payment_source` model — it switches on `payment_source_type`, which the newer model has no equivalent of. On the `payment_sessions` model there are no Payment Methods to iterate, so nothing ever mounts it. The two models are two separate component trees, chosen once per order."

> **Dev:** "The shopper picked bank transfer and the button says the payment doesn't cover the order. Do I show that?"
> **Domain expert:** "Not yet. Authorizing a manual payment runs in a background job, so the first `_placeable` fails while the money is still being taken. Retry a few times first — that error is only true if it survives the last attempt."

> **Dev:** "Their previous attempt failed. Do I delete that Payment Session before making a new one?"
> **Domain expert:** "No. It stayed `unpaid`, so it counts toward nothing — leave it. And a sales-channel token may not be allowed to delete it anyway, once a failed authorization is hanging off it."

> **Dev:** "Where does the library keep which Payment Setting the shopper picked?"
> **Domain expert:** "On the order. The Payment Session is created when they pick, so the choice is `order.payment_sessions[].payment_setting` — it survives a reload, and on a mismatch the order wins over local state. What browser state adds is only the rendering of it."

## Flagged ambiguities

- ~~Gift cards on the `payment_sessions` model are undecided and out of scope.~~ **Resolved.** A gift card is spent by creating a Payment Session against a `payment_setting_gift_cards` setting — it is a payment method, not an order-level code. On the `payment_sessions` model `GiftCardOrCouponForm` therefore works on the coupon only, overriding an explicit `codeType="gift_card_code"`. Note the trigger named in the original entry never existed: there is no `_gift_card_or_coupon_code`, only the plain order attribute `gift_card_or_coupon_code`, and the components write `gift_card_code` / `coupon_code` directly. See `docs/adr/2026-08-18-payment-session-lifecycle.md`.
- **Three official sources are wrong about this domain**, so verify against `core-api` rather than the SDK types or the docs: `available_payment_methods` is annotated `@deprecated Last available in API version 2017-08` but is still served on `2026-05`; `payment_type` is documented as `"manual_payment"` but the real values are uppercase (`MANUAL`, `GIFT_CARD`, …); and both `status` fields are typed as bare `string` with a single `@example`, hiding state machines of seven and eight values.
- "the session's type" was used to mean the gateway (e.g. "manual") — but `payment_session.type` is always the literal `"payment_sessions"` (the resource type). The gateway is `payment_session.payment_setting.type` (e.g. `payment_setting_manuals`). When someone says "the session type", ask which one they mean.
- "the payment is done" was used for both a created **Payment Session** and a taken payment — resolved: only a `succeeded` **Payment Authorization** means paid; a session on its own means nothing was taken.
- "placeable" was used for both the readable order attribute and the `_placeable` validation trigger — resolved in the glossary above; when someone says "check if it's placeable", ask whether they mean reading the attribute or asking the API.
- "set payment source" was used to mean both the async operation that creates/attaches a Payment Source *and* the reducer action that stores it in state — resolved: the operation is `setPaymentSource(...)`, the reducer action is `dispatch({ type: "setPaymentSource" })`.
