# Saving cards through `vaulting` on the Payment Session

**Date:** 2026-09-29
**Status:** accepted
**Scope:** storing a card for a signed-in customer on Adyen and Stripe, on the
`payment_sessions` model. Paying with a stored card, and order subscriptions, are out of scope.

## Context

Until now, saving a card went through two different doors, one of which was shut:

- **Adyen** sent `_internal_version: "Tokenization"` on the session create
  (`2026-09-02-adyen-payment-setting.md`, "Saving a card uses Adyen's wallet").
- **Stripe** could not save at all. The PaymentIntent carried no Customer, and the only
  client-reachable lever, `options.setup_future_usage`, is `prohibited` for a storefront token
  (`2026-09-09-stripe-payment-setting.md`, "Card saving is not in this iteration").

`core-api` replaced both with one attribute. `vaulting` on `payment_sessions`
(`config/attributes/payment_session.yml`, `creatable: true`, `updatable: false`) asks Commerce
Layer to store the instrument during the charge, and Commerce Layer then links a
`payment_wallet` to the session **by itself**:

- **Stripe** — the PaymentIntent is created with `setup_future_usage: off_session` and a Stripe
  Customer (`Payment::Payload::Stripe::PaymentIntent::Base`, `Payment::Session::Stripe#customer_reference`),
  and the authorization links the wallet from the confirmed intent's `payment_method`
  (`Payment::Session::Stripe`, `session.link_wallet!`).
- **Adyen** — the session is created with `storePaymentMethodMode: askForConsent`, the customer's
  `shopperReference` and the matching `recurringProcessingModel`
  (`Payment::Payload::Adyen::Session::Base`), and the wallet arrives from the
  `RECURRING_CONTRACT` webhook (`Payment::EventHandler::Adyen#recurring`, `link_session`).

`9edd1fb6e` removed the `Tokenization` variant, and `_internal_version` is validated by name
(`InternalVersionable#valid_internal_version?`). So the library as it stood was not merely
outdated: **every Adyen session created with a customer token was a 422**.

## Decision

**Send `vaulting`, never write a wallet.** The library asks and Commerce Layer does the rest; no
wallet is created, read or polled from the client. `createPaymentSession` takes `vaulting` in
place of `internalVersion`, which had no other use.

**Only for a signed-in customer, decided from the token.** The gate is the one the Tokenization
variant had, for the same reason: Commerce Layer puts a customer on nearly every order with an
email, so deciding from `order.customer` would store a guest's card against whoever typed that
address. A guest's session never carries `vaulting`.

**Who gives consent is the gateway's shape, not a policy of ours.**

- **Adyen asks on its own.** `askForConsent` makes the Drop-in render "Save for my next payment",
  so `vaulting` is sent on every signed-in customer's Adyen session and the shopper chooses
  there. The Drop-in also leads with the cards already stored under that `shopperReference`.
- **Stripe cannot ask.** A secret-driven Payment Element has no consent checkbox without a
  Customer Session, which only a secret key creates. So the consent is the application's:
  `<PaymentSetting>` exposes `canSaveCard`, `saveCard` and `setSaveCard` in its render prop and
  context, and renders no control of its own — the copy and the placement are the application's
  (`2026-09-01-presentation-belongs-to-the-application.md`).

**Changing the Stripe choice replaces the session.** `vaulting` is fixed at creation and, once
`setup_future_usage` is on the intent, a publishable key cannot take it off. So `setSaveCard`
runs the ordinary selection with the choice attached: a new session with the new `vaulting`,
the old one cleared the way a superseded selection always is, the Element remounting on the new
PaymentIntent. The alternative — sending `vaulting` on every Stripe session — would store cards
nobody agreed to store.

`saveCard` is read from the session (`currentPaymentSession.vaulting`), so a reload keeps the
choice. While a replacement is in flight it shows the requested value instead, because a
checkbox that does not move for the second the API takes reads as a click that was ignored.
`setSaveCard` does nothing while a payment is being collected: that payment settles against the
session it started on.

**Reuse respects the flag.** `findReusablePaymentSession` takes `vaulting` and does not adopt a
session created the other way, when the caller says which way it needs. Adyen passes its own
answer; Stripe passes nothing on an ordinary selection, so the session carrying the shopper's
earlier choice is adopted rather than overwritten.

**The superseded-session rule moved from "a different setting" to "a new session was made".**
Clearing used to be skipped whenever the shopper stayed on the same setting, as a proxy for
"adopted". A save-card change creates a new session *on* the same setting, so the rule is now
the thing it stood for: clear the previous selection whenever a new one was created, still never
one holding money and never one whose payment is in flight.

## Consequences

**Ticking the box after typing costs the typed card.** The Element remounts on a new intent. The
application should render the control above the form — mfe-checkout does.

**Adyen's consent cannot be made mandatory.** Commerce Layer always sends `askForConsent`, so a
flow that must store the card cannot suppress the Drop-in's opt-out. Relevant to subscriptions,
which are out of scope here.

**A stored card paid from the Drop-in's own list bypasses the `payment_wallet`.** It pays with
Adyen's `storedPaymentMethodId`, and the session is not linked to a wallet. Paying with a wallet
through Commerce Layer — a list of `payment_wallets` and a session created with
`payment_wallet` — is the follow-up, and it is the one both gateways would share.

**Stripe duplicates wallets, and nothing can remove them.** Every confirmation of a typed card
creates a new Stripe PaymentMethod, and `link_wallet!` looks an existing wallet up by
`payment_token` — the `pm_` id — so saving the same card again makes another wallet. Adyen does
not have the problem: the same card comes back with the same stored token and the wallet is
reused. A wallet linked to a payment session cannot be deleted by any token (423 — `has_many
:payment_sessions, dependent: :restrict_with_exception`, a model-level rule), and a customer
token may not send `_cancel` (401 — `prohibited: [write]` for sales-channel tokens).

An integration token may send `_cancel`, and what it does depends on the gateway. On Adyen,
`Payment::Wallet::Adyen#cancel` deletes the stored payment method at Adyen and moves the wallet
to `canceled`. On Stripe it does not retire a vaulted wallet: `cancel_wallet` runs, since
`PaymentWallet.factory` always assigns a `token` (a random hex when none is given), but
`Payment::Wallet::Stripe#cancel` calls `SetupIntent.cancel(wallet.token)` — and a wallet linked
from a PaymentIntent has no SetupIntent, so Stripe answers with an error that `rescue_and_log`
swallows, and the wallet stays `succeeded`. Read from the code, not tried.

Two asks follow for `core-api`: deduplicate Stripe wallets by `card.fingerprint`, and let a
customer retire a wallet that is in use — which on Stripe means detaching the `pm_` from the
Customer rather than cancelling a SetupIntent. The second matters to the saved-cards follow-up,
where a shopper will expect to remove one.

**Verified end to end** in mfe-checkout's `payment-sessions-vaulting.spec.ts` on a customer
order, for both gateways, on 2026-09-29: the session reads `vaulting: true` and a
`payment_wallet` is linked to it after the payment. The Stripe test is kept skipped because of
the paragraph above — every run would leave one more undeletable wallet on the test customer.
