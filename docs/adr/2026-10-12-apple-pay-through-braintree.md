# Apple Pay through Braintree: a button beside the card, not a method inside it

**Date:** 2026-10-12
**Status:** accepted — unit-tested; the Safari run on a registered domain is still to do
**Scope:** `<PaymentSettingBraintreeApplePay>`, on the `payment_sessions` model, beside the card
fields of `2026-10-12-braintree-payment-setting.md`. Google Pay is deferred: in `PRODUCTION`
Google requires a merchant ID in the payment data request, which only the browser can send and
which `payment_setting_braintrees` does not carry. mfe-checkout is hosted for every organization
and configured from the access token, so the only workable home for it is an attribute on the
setting — an ask for `core-api`.

## Context

What `core-api` (`master` at `c9a90b2c6`) does with an Apple Pay nonce: the same as with a card's.
`client_data.payment_method_id` takes any `paymentMethodId`, and the authorization relays it to
`authorizePaymentMethod` / `chargePaymentMethod` unchanged. Nothing on the setting is specific to
wallets. One gap: `Payment::Instrument::Braintree` maps `CreditCardDetails`, PayPal, Venmo and US
bank accounts only, so an `ApplePayCardDetails` snapshot leaves `payment_instrument` empty and the
recap shows no card.

The Braintree sandbox merchant behind `new-payments-demo` had neither Apple Pay nor Google Pay
enabled on 2026-10-12: the configuration `braintree-web` fetches with a session's client token
carried no `applePayWeb` and no `androidPay`. Enabling it, registering the domain and serving
Braintree's `/.well-known/apple-developer-merchantid-domain-association` on it are configuration,
not code.

## Decision

### A component of its own, mounted beside the card fields

Adyen's Drop-in has a selection of its own — the shopper opens the card or Apple Pay — and the
handoff follows it: a Gateway-Owned Button registered while Apple Pay is open, and the place button
disabled with a hint. Braintree has no such selection: Hosted Fields and Apple Pay are two separate
modules. Rather than invent one, both stay live — `<PlaceOrderButton>` pays by card, Apple's button
pays through Apple's sheet — and `<PaymentSettingBraintreeApplePay>` is its own component, which the
application places. The card's host collection stays registered throughout; Apple Pay reports as
an **Out-of-Band Collection**.

On a browser without Apple Pay the component renders nothing, children included, so an application
puts its "or pay by card" divider in the children and nothing is left standing on Chrome.

### Mounting is the opt-in

For the reason it is opt-in on Adyen: `canMakePayments()` answers for the device, while whether this
domain is registered for Apple Pay on the Braintree merchant is settled at merchant validation, after
the tap. So there is no flag — an application that mounts the component is saying its domains are
registered, and mfe-checkout says so in a comment.

### The same three moments as Adyen's wallets, in Apple's own callbacks

`braintree-web/apple-pay` is not a UI: it builds the payment request, validates the merchant and
tokenizes Apple's token. The `ApplePaySession` is ours, so the moments Adyen's `walletConfiguration`
reaches through its callbacks are ours directly:

1. **The click** — the privacy-and-terms gate, synchronously, then `new ApplePaySession(3, …)` and
   `begin()`. Nothing is awaited before `begin()`: it has to run inside the click's gesture.
2. **`onvalidatemerchant`** — `performValidation` with the store's name; a failure aborts the sheet.
   No server and no certificate: Braintree validates against its own Apple merchant identity.
3. **`onpaymentauthorized`** — the gift cards, then `tokenize`, then `authorizeBraintreePaymentSession`
   with the nonce on the same Payment Session as the card's, then `completePayment` with the verdict.
   A gift card that cannot be charged is answered with an `ApplePayError`, and Apple keeps the sheet
   open for another try.

No 3DS: an Apple Pay payment carries the device's cryptogram. The total shown is the session's
amount, which is the remainder after the gift cards.

`ApplePayError` is shared with the Adyen component now (`utils/applePay.ts`), and so are
`interopDefault`, `braintreeErrorCode` and the session amount with the card component
(`utils/braintree.ts`).

### The place button now hears an outcome after a refusal

Found while designing this, and not specific to Braintree. `<PlaceOrderButtonPaymentSessions>`
acted on the first out-of-band outcome and **never on another**: a `ref` flipped once and was never
reset, and nothing returns the store to `no`. So a wallet payment refused, the shopper picking the
method again and paying on the same page, left the second attempt's `done` unheard — the money taken
and the order never placed. The Adyen wallets had the same exposure.

A `done` is still acted on once only — placing twice is the failure that guard was for — but a
handled `failed` now re-arms the button for whatever outcome comes next, and a further failure is
heard once the phase has moved on (`no` / `in-progress`) from the first. The Braintree Apple Pay
component sets `in-progress` when the shopper authorizes in the sheet, so each attempt is a fresh
phase. Adyen's wallets do not, so two refusals in a row there still report only the first; the
retry that succeeds is heard either way, which was the part that cost money.

## Consequences

**The card stays live while Apple Pay is on screen.** Unlike Adyen's hint ("complete your payment
with the button above"), the place button is not disabled: both are real routes, on one session.
`<PlaceOrderButton>` shows itself busy while the Apple Pay payment is in flight.

**A refusal costs both routes.** It burns the session, which the place button discards (or abandons,
at `423`), so the card form goes with it and the shopper picks Braintree again.

**Apple's sheet has a time limit.** `onpaymentauthorized` must be answered within about thirty
seconds; past that Safari closes the sheet and `completePayment` throws. The authorization is still
awaited and its outcome still reaches the order — guarded and tested — but the shopper sees the
sheet close without a verdict on the rare payment that takes that long.

**Nothing past the tap runs in a test.** Sixteen unit specs cover availability, the gate, merchant
validation, the gift-card moment, the verdicts and the closed-sheet case, against a fake
`ApplePaySession`. The live run needs Safari, the domain registered on the Braintree sandbox merchant
with Braintree's association file served on it, Apple Pay enabled there, and a sandbox tester.

**The live run should confirm, in this order:** the button appears on the registered domain and not
on Chrome; tapping opens the sheet (the gesture survived); merchant validation passes; the order
places after on-device authorization; a gift card that cannot be charged shows something legible in
the sheet; and what the thank-you recap shows with an empty `payment_instrument`.
