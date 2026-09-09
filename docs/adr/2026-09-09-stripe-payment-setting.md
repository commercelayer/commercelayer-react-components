# Stripe cards: the card mechanism, unchanged

**Date:** 2026-09-09
**Status:** accepted
**Scope:** `payment_setting_stripes` through Stripe's Payment Element, on the `payment_sessions`
model, cards only

## Context

The Adyen work left a question for the next gateway: _where is the moment before the money that
we control?_ Every wallet needed its own answer, and each one cost a bespoke hook.

Stripe answers it the same way the card does, and that is the finding. Its Payment Element is
inert until something calls `confirmPayment`, so `<PlaceOrderButton>` is the pay button, the
privacy-and-terms gate stays in front of the payment, and the gift cards are charged before it.
**Nothing in the handoff, the gate or the gift-card ordering changed to accommodate it.**

Verified before writing any of it, against `core-api`, the installed SDK and a real PaymentIntent
rather than the docs:

- **The dependency was already there.** `@stripe/react-stripe-js@^6.8.1` and
  `@stripe/stripe-js@^9.10.0`, the same majors the payments playground uses, because the
  `payment_source` model's `StripePayment` has used `Elements` + `PaymentElement` +
  `confirmPayment` for years. One SDK, no duplicate import — the constraint Adyen's bump was held
  to.
- **The session is a PaymentIntent.** `Payment::Session::Stripe#create` calls
  `PaymentIntent.create` and stores `intent.to_hash`, so the browser reads
  `response_data.client_secret`. `public_key` is `fetchable` on the setting, reachable the same
  way Adyen's Client Key is: the order with `available_payment_settings`.
- **The webhook is Commerce Layer's.** `after_create :create_webhook_endpoint` registers it
  through Stripe's API. The failure that cost half a day on Adyen — a webhook nobody had
  registered for a newly created setting — cannot happen here.
- **A real intent, read from the API:** `capture_method: "manual"`,
  `payment_method_types: ["card", "link", "amazon_pay"]`,
  `automatic_payment_methods: { allow_redirects: "always" }`, `customer: null`, expiry seven days.

## Decision

### `redirect: "if_required"`, so the outcome comes back to us

3DS happens in place and `confirmPayment` resolves with the result, which is what lets `submit()`
return a settled `PaymentGatewaySubmitResult` exactly as the Adyen card path does. `"always"`
would push every payment through a page reload and the out-of-band machinery for no gain.

Note that `requires_action` is a live state here, which it never was with Adyen's Drop-in. With
`if_required` Stripe completes the action itself, so an intent still in `requires_action` when the
promise resolves means it neither completed nor redirected — reported as **unknown**, because what
happened is not known and an unknown outcome may not be rolled back.

### `requires_capture` is success

The intent is created with `capture_method: "manual"` unless the setting captures automatically,
so a successful authorization stops at `requires_capture` and never reaches `succeeded` until
something captures it. Reading only `succeeded` as success would fail every payment on this
account. `core-api` agrees:
`ACTION_STATES[:succeed][:authorization]` is `%w(requires_capture succeeded)`.

`processing` counts too, for the reason `Pending` does on the Adyen path: Stripe has accepted, the
authorization settles on a webhook, and `placeOrderWithPaymentSessions` already polls for exactly
that.

### Which of Stripe's failures may be rolled back

The handoff's distinction is not severity, it is whether a rollback is safe.

| Stripe says                                                    | Reported as              | Why                                                                     |
| -------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `elements.submit()` errors                                     | `incomplete`             | The Element is showing its own validation; the shopper has not finished |
| `validation_error`                                             | `incomplete`             | Same                                                                    |
| `card_error`                                                   | `failed` + Stripe's code | A verdict: no money moved                                               |
| `api_error`, `api_connection_error`, `authentication_error`, … | `unknown`                | The confirmation may have reached Stripe                                |
| intent `requires_payment_method`, `canceled`                   | `failed`                 | A verdict                                                               |
| intent `requires_action`                                       | `unknown`                | Neither completed nor redirected                                        |

`decline_code` is preferred over `code`, because it says _why_ rather than _what_.

### We cannot restrict the Element to cards, and accept that

Adyen took `allowPaymentMethods`. Stripe's Element is driven by the client secret, so its methods
come from the intent — Commerce Layer sends no `payment_method_types`, which leaves it to the
Stripe Dashboard. `paymentMethodOrder` orders them; nothing filters them. So this account offers
Card, Link and Amazon Pay, and the merchant's lever is the Dashboard.

Which brings the redirect return into this iteration rather than a later one: `allow_redirects` is
`"always"`, so a method the shopper picks can take the browser away. `useStripeRedirectResume`
mirrors the Adyen hook — it reads `payment_intent_client_secret` from the URL, matches it against
the session's own secret, retrieves the intent and reports an **Out-of-Band Collection**. Same
shape, same reasons, including living in `<PaymentSetting>` rather than the gateway component so
a checkout that comes back with its payment step collapsed still finishes.

### The client secret is remembered until the session changes

Read literally, a refetch that arrives without `response_data` — not every consumer's `fields`
allowlist includes it — means "no session", and the Elements group unmounts. A shopper halfway
through typing their card loses it.

Found the hard way: an end-to-end run came back with a single digit in the card number, after a
gift card had made the application refetch mid-typing. So the secret is kept until the **session
id** changes, which is the only thing that actually invalidates it.

`<Elements>` is keyed on that secret, because `options.clientSecret` is read when the group is
created and ignored afterwards — a session replaced after a refusal would otherwise leave the
Element confirming a burnt intent.

### Card saving is not in this iteration — but only one of its two forms is blocked

Deliberately not built, having established what it would take.

The consent can be **ours**: `ConfirmPaymentData` extends `PaymentIntentConfirmParams`, which
carries `setup_future_usage`, so a checkbox of our own plus a confirm param makes saving opt-in by
construction — no `options` (`prohibited` for a storefront token), no `_internal_version`, no
Commerce Layer change.

What blocks it is that Stripe needs a **Customer** on the intent to save a payment method, and
`Payment::Payload::Stripe::PaymentIntent::Base` sets `customer` only when the session is paying
_with_ an existing wallet. A first-time save has none — confirmed on a live intent:
`customer: null`.

And doing it the way Adyen does — the gateway's own wallet, surfaced by the gateway's own UI, no
Commerce Layer `payment_wallets` — needs **two** things Commerce Layer does not expose: that
customer, and a **Customer Session** client secret, which `Elements` accepts as
`customerSessionClientSecret` and which only a secret key can create. Adyen packs its equivalent
into the session it already creates, which is why one field was enough there.

There is an internal version that would set `setup_future_usage` server-side —
`Payload::Stripe::PaymentIntent::V20251231` — and it is the wrong tool: unconditional
`off_session` across eleven method types, with no consent UI, so cards would be saved without
being asked.

**Corrected: Commerce Layer's own wallet works today.** An earlier draft said saving was blocked
server-side, full stop. Only the _gateway-side_ form is. `Payment::Wallet::Stripe#create` derives
a Stripe Customer, calls `PaymentMethod.attach(payment_token, { customer: … })` and creates a
**SetupIntent** with `setup_future_usage: "on_session"` — no `options` anywhere — and
`Payload::Stripe::PaymentIntent::Base` then passes `customer` and `payment_method` back from the
wallet on the next payment. That is how the payments playground's saving worked, and still would:
its `options: { setup_future_usage }` line has been dead since `options` was prohibited in late
July and was never the essential part.

What it costs: a **customer token**, since `customer_ability.rb` grants `create` on
`PaymentWallet` only for `customer_id: jwt.owner_id` — a guest cannot save a card, which is
right — and a saved-cards list of our own, because a Commerce Layer wallet is not a Stripe one and
Stripe's Element cannot show it. The playground renders exactly that list.

So the follow-up is a choice rather than a wait: the gateway's wallet inside the Element, blocked
on the ask above and symmetric with Adyen; or Commerce Layer's wallet, available now and thrown
away if the first ever lands.

## Consequences

**The card mechanism generalised.** Two gateways now share the gate, the gift-card ordering, the
handoff and the out-of-band path with no abstraction added for either. That is the evidence for
extracting a shared gateway layer — from two implementations rather than one, which was the plan.

**Link is on screen and it takes the focus.** Stripe's Link expands an inline sign-up as soon as a
card number is typed. It broke an end-to-end test in a way that read as a mistyped card, and it is
not deterministic — it depends on how long Link's iframe has had to wake up. The fixture now
verifies each field and refills it. Worth knowing before a shopper reports it.

**The Element's readiness is rendered, not just returned.** The place-order button does not gate on
it — an incomplete form makes `elements.submit()` show its own validation and the button then
reports nothing, by design — so without a marker in the DOM an end-to-end failure looks like a
payment that never arrived rather than a form that was never finished.

**Nothing here is Apple Pay or Google Pay.** Those are Stripe's Express Checkout Element, a
separate component with its own button, and they will be the Gateway-Owned Button case again.
