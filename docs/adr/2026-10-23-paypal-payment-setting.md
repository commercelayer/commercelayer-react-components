# PayPal as a payment setting: PayPal's v6 button on the order Commerce Layer creates

**Date:** 2026-10-23
**Status:** proposed — unit-tested; the browser run waits on a staging environment serving the
setting's `client_id`
**Scope:** `<PaymentSettingPayPalPayment>`, for `payment_setting_paypals` (PayPal Orders v2 through
Commerce Layer) on the `payment_sessions` model: one-time payments and saving the PayPal account.
Paying with a stored account is out of scope, as for every gateway. The `payment_source` model's
`<PaypalPayment>`, a redirect to PayPal and back, is untouched.

## Context

PayPal is now a gateway of its own, not only a method inside Adyen or Braintree. Verified on staging
with a sales-channel token before writing any of it:

- **The setting carries the browser credential.** `client_id`, the public half of the PayPal REST
  app, is returned in `order.available_payment_settings`. The SDK's `PaymentSettingPaypal` type does
  not declare it yet, so it is read through a cast.
- **The session creates the PayPal order.** `POST payment_sessions` creates a PayPal order for the
  session's `amount_cents` straight away, and the session's `token` is that order's id. One PayPal
  order per session, so a session for the remainder after gift cards is a PayPal order for the
  remainder. The item breakdown is sent only when the session covers the whole total.
- **Approval writes nothing back.** PayPal records the approval on its own order. The Payment
  Authorization is what moves the money — PayPal's authorize, or capture with `auto_capture` — and it
  is created afterwards and polled until it leaves `pending`.
- **Saving needs URLs nobody visits.** `vaulting: true` makes Commerce Layer ask PayPal to store the
  account once the payment succeeds, and link the `payment_wallet` itself at authorization. It is
  refused without `client_data.return_url` and `cancel_url`, even though a popup never sends the
  shopper to either.
- **The environment follows the organization's mode.** Commerce Layer talks to PayPal's sandbox for a
  test organization and to production for a live one; the access token's `test` claim is the same
  flag.

## Decision

### A Gateway-Owned Button, as PayPal is everywhere

PayPal's window opens only from a click on PayPal's own button, so `<PlaceOrderButton>` cannot start
it. The component registers a **gateway collection** for as long as PayPal is the selection: the
place button disables itself and says why, rather than offering a route that leads nowhere. The
order is placed without a click of ours once the payment is authorized, as an **Out-of-Band
Collection** — the mechanism PayPal through Adyen and Braintree already use.

### Nothing awaited before `start`

v6 differs from the SDK the other PayPal buttons load in one way that shapes the click: there is no
`onClick` that PayPal awaits before opening its window. The page opens it itself, through
`session.start()`, and a browser lets a page open a window only inside the user's gesture — an
`await` before `start` spends it and the window is blocked. So the click does, synchronously:

1. the privacy-and-terms gate, which is a read of state already on the page — refused, nothing opens;
2. `start({ presentationMode: "auto" }, paypalOrder)`, where `paypalOrder` is a promise that
   **first charges the gift cards**, then resolves to the session's PayPal order.

PayPal's window opens at once and shows its own loading state until the promise settles, so the
**Gift Card Moment** is unchanged — the cards are charged inside PayPal's click, before the shopper
can approve anything — and a refused card rejects the promise, which closes the window. PayPal then
reports that rejection as an error of its own; the component keeps the gift card's reason on screen
instead.

### The approval is handed to Commerce Layer, and the authorization is what moves the money

`onApprove` creates the Payment Authorization and polls it until it leaves `pending`, then reports
the out-of-band collection `done` or `failed`. The polling is `authorizePaymentSession` in
core-components — Braintree's helper, without the step that stores a nonce, which PayPal has no use
for: approval writes nothing to the session. An approved PayPal order is authorized once, so a
refusal burns the session, and the shopper picks PayPal again on a new session and a new PayPal
order — what the place button already does for every burnt session.

### The SDK under a namespace of its own, in the organization's environment

`@paypal/paypal-js` is a new dependency, imported at run time like `braintree-web`, so it stays out
of every checkout that never offers PayPal. Its core script is loaded once per page under
`commercelayerPayPal`: the Adyen Drop-in loads PayPal's older SDK under the default `paypal` global,
and two scripts writing one global leave whichever loaded last driving both.

The environment is the access token's `test` claim — sandbox for a test organization, production
for a live one — which is the choice Commerce Layer makes when it creates the PayPal order. A button
in one world cannot approve an order in the other.

### Saving the account: the application asks, as on Stripe and Braintree

PayPal's window asks the shopper to agree to future payments only when the PayPal order was created
to store the account, so the consent has to come first, from the application: `offersSaveCard`
answers `true` for PayPal and a signed-in customer, and `canSaveCard` / `saveCard` / `setSaveCard`
work unchanged — the choice replaces the session, which here means a new PayPal order.

`client_data.return_url` and `cancel_url` are sent on **every** PayPal session, not only on one that
stores: whether it stores is the shopper's choice, merged in after the setting's attributes are
built. They are the page's URL without its query string — never the application's `returnUrl` —
because nobody is ever sent there, and a checkout's query string can carry its access token, which
has no business reaching PayPal.

### Not offered is said, not hidden

A setting without `client_id` is skipped by `<PaymentSetting>`, like a card gateway without its
public key: a radio that leads to a button that cannot load is worse than no radio. When PayPal's
SDK does not load, or says this buyer or currency is not eligible, the component renders no button
and gives its children `isUnavailable` — PayPal is the setting's only way to pay, so unlike
Braintree's PayPal, which sits beside card fields, silence would leave a selected method with
nothing under it.

## Consequences

**The browser run has not happened yet.** As of 2026-10-27 the staging environment the end-to-end
tests run against does not serve the setting's `client_id` yet, so the library skips the setting and
mfe-checkout's `payment-sessions-paypal-setting.spec.ts` cannot reach the button. The spec covers
the handoff to PayPal's button, the terms gate, a whole order, a gift-card split and saving the
account on a customer created for the run.

**Paying with a stored PayPal account** — a session with the `payment_wallet` relationship, which
PayPal processes without a window — belongs to the stored-wallet follow-up all gateways share.
