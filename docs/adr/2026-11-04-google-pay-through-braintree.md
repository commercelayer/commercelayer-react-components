# Google Pay through Braintree: Apple Pay's shape, with Adyen's Gift Card Moment

**Date:** 2026-11-04
**Status:** accepted — unit-tested, run in mfe-checkout's e2e on the sandbox merchant up to
Google's sheet opening, and paid by hand in Chrome on the sandbox (2026-11-04)
**Scope:** `<PaymentSettingBraintreeGooglePay>`, on the `payment_sessions` model, beside the card
fields of `2026-10-12-braintree-payment-setting.md` and the Apple Pay button of
`2026-10-12-apple-pay-through-braintree.md`. Issue #910.

## Context

`2026-10-12-apple-pay-through-braintree.md` deferred Google Pay: in `PRODUCTION` Google requires a
merchant ID in the payment data request, and `payment_setting_braintrees` has nowhere to store
one. Two things changed since. PayPal's certification review of the Braintree integration asked
which wallets are offered, and Google Pay was enabled on the sandbox merchant behind
`new-payments-demo`. A sandbox merchant pays in Google's `TEST` environment, which needs no
merchant ID, so the component can be built and run before core-api has an attribute for it.

Verified against the installed `braintree-web@3.144.0`:

- **The environment comes with the request.** `createPaymentDataRequest()` returns Braintree's
  defaults with `environment` already set from the merchant's: `PRODUCTION` for a production
  merchant, `TEST` otherwise. No prop or guess is needed to pick it.
- **The merchant ID goes in at creation.** `googlePayment.create({ googleMerchantId })` puts it in
  the request's `merchantInfo`. An override of `merchantInfo` replaces that object, so this
  component sets both the ID and the store's name itself.
- **Not enabled means `create` rejects.** Without `androidPay` in the merchant's configuration,
  `create` rejects with `GOOGLE_PAYMENT_NOT_ENABLED`.
- **PayPal can ride along.** When the merchant has PayPal linked, the default request adds a
  `PAYPAL` method to Google's sheet.
- **`parseResponse` says what kind of card it was.** `details.isNetworkTokenized` is `true` for
  a card on a device (a network token with the device's cryptogram) and `false` for a card saved
  to the Google account (the card number itself).

core-api treats a Google Pay nonce like any other: `client_data.payment_method_id` is relayed to
`authorizePaymentMethod` / `chargePaymentMethod` unchanged.

## Decision

### A component of its own, beside the card fields

For the reasons the Apple Pay one is: Braintree has no selection between methods, so the card
fields stay live, `<PlaceOrderButton>` pays by card, and Google's button pays through Google's
sheet. The card's host collection stays registered throughout; Google Pay reports as an
**Out-of-Band Collection**. When Google Pay can't be offered (not enabled on the merchant, no
Google Pay in the browser, a production merchant without a merchant ID) the component renders
nothing, children included.

Unlike Apple Pay, it isn't a deliberate opt-in. Being offered is evidence it can work: Google has
no merchant validation after the click, and `isReadyToPay()` answers before anything renders.
mfe-checkout mounts it unconditionally.

### Gift cards on `onPaymentAuthorized`, the money after the sheet closes

This is Google Pay's **Gift Card Moment** as on Adyen, for the same reasons. The click can't hold
it, because `loadPaymentData()` must run inside the click's gesture. `onPaymentAuthorized` fires
after the shopper has chosen a card and before anything reaches Braintree, and an `ERROR` answer
shows our message inside Google's sheet, which stays open for another attempt.

The rest waits until the sheet has closed and `loadPaymentData()` has resolved: `parseResponse`,
3DS where it applies, then `authorizeBraintreePaymentSession` on the same Payment Session as the
card's. That is where this differs from Apple Pay, which does everything inside
`onpaymentauthorized` and answers the sheet with the authorization's verdict. Two things push it
out of the sheet here:

1. **3DS needs the page.** A challenge opens in Braintree's modal, which would sit under Google's
   sheet.
2. **Google has no "processing" state to hold.** Apple's sheet spins while we wait; Google's
   callback is expected to answer quickly.

So the shopper sees Google's sheet close on success and the outcome on the page, the same way a
card payment ends.

### 3DS for a card that is just a card number

A network-tokenized card carries the device's cryptogram and skips 3DS, as Apple Pay does. A card
saved to the Google account (`PAN_ONLY`) is a card number, the same thing the shopper would type
into the card fields, so it goes through the card's 3DS. `threeDSecure` and
`requireLiabilityShift` mean what they mean on `<PaymentSettingBraintreePayment>`, and the 3DS
instance is the page's one, shared with the card form, because Cardinal sets up only once per
page. To share that code, `verifyCard` and `liabilityRefusal` moved from the card component to
`utils/braintree.ts`.

A 3DS failure, like a token Braintree can't read, leaves the out-of-band state at `no`. Nothing
reached Commerce Layer, the session is intact, and the shopper can pay another way. Only a
refusal from the authorization itself is handed to the place button as `failed`.

### Cards only

The request is narrowed to `CARD`. PayPal has its own button beside this one, and offering it a
second time through Google's sheet would be a second PayPal flow to support for no gain.

### The merchant ID is a prop, for now

`googleMerchantId` is optional. A production merchant without it renders nothing and logs
`GOOGLE_MERCHANT_ID_MISSING` in development. The Apple Pay ADR's point still holds: mfe-checkout
is hosted for every organization, so a prop isn't somewhere it can keep a merchant's ID. Its home
is an attribute on `payment_setting_braintrees`, requested from core-api separately. Once that
attribute exists, the component reads it and the prop becomes an override.

## Consequences

**Production waits on core-api.** mfe-checkout offers Google Pay through Braintree on sandbox
merchants only, until the setting carries the merchant ID.

**A refused gift card is the only failure shown inside Google's sheet.** Everything after the sheet
closes (a failed challenge, a decline) is shown on the page through the component's children and,
for a decline, the place button's outlet.

**`pay.js` is loaded from Google, once per page.** `utils/googlePay.ts` injects it, and reuses the
API when another integration on the page has already loaded it. A failed load is forgotten, so the
next mount retries.

**What runs in a test.** Eighteen unit specs, against a fake `PaymentsClient` that plays the sheet,
cover availability (including the production merchant ID), the gate, cancellation, the gift-card
moment, 3DS for network-tokenized and plain cards, a failed challenge, a decline and an unreadable
token. As with Adyen, the browser run needs a signed-in Google account, so the mfe-checkout e2e
stops where the sheet opens.

**Run by hand in Chrome, 2026-11-04.** A signed-in Google account paid an order on the sandbox
merchant with a `TEST` card: the button showed, the sheet opened from the click, and the order was
placed without a click of ours.

**Not recorded from that run:** whether Google returned the card as a plain card number, and so
whether 3DS ran, and what `payment_instrument` shows for a Google Pay card. For Apple Pay, Braintree
reported a `CreditCardDetails` snapshot.
