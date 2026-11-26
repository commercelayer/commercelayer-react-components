# Apple Pay and Google Pay through Checkout.com: the wallets' own components, the lock on authorization

**Date:** 2026-11-25
**Status:** accepted. Google Pay was checked in Chromium against the staging sandbox; no wallet payment has been completed, since that needs a Google account in the sheet. Apple Pay is unverified.
**Scope:**
- `<PaymentSettingCheckoutComGooglePay>` and `<PaymentSettingCheckoutComApplePay>`, over a shared implementation in `components/utils/CheckoutComWallet.tsx`.
- Wallet payments on `payment_setting_checkout_coms`, on the `payment_sessions` model.
- Out of scope: the other methods Flow offers.

## Context

The Checkout.com setting (`2026-11-25-checkout-com-payment-setting.md`) mounts the card component only. Checked on the sandbox before adding the wallets:

- **The wallets are offered without asking.** The API creates the Checkout.com payment session with no `enabled_payment_methods`, and Checkout.com offers `card`, `applepay` and `googlepay` on it.
- **The session carries the wallets' configuration.** Google Pay's merchant ID comes with it, set up on the Checkout.com account, so the setting needs nothing that Braintree's would. Apple Pay's display name and networks come with it too.
- **The wallets have components of their own.** `applepay` and `googlepay` are created from the same payment session as the card form. `isAvailable()` says whether the session offers the wallet and the browser can pay with it.
- **The callbacks are wallet callbacks:**
  - `handleClick` is raised before the sheet opens.
  - `onAuthorized` is raised once the shopper has confirmed in the sheet, before the payment is submitted. Both can answer `{ continue: false }`.
  - `submit()` is not available for wallets: their button is theirs.
- **Closing the sheet raises nothing.** No callback came within 25 seconds of the shopper closing Google Pay's sheet unpaid, and the next click opened it again.

## Decision

### The wallets' own components, beside the card form

Each wallet is a component of its own, mounted beside the card form on the same Payment Session, as Braintree's wallets sit beside its Hosted Fields:

- The card form keeps its host collection, and `<PlaceOrderButton>` keeps paying for cards.
- A wallet registers no collection. Its payment is an **Out-of-Band Collection**: `in-progress` once the gift cards are charged, then `done` or `failed`. `<PlaceOrderButton>` places the order on `done` without a click.
- A wallet renders nothing where `isAvailable()` is false, children included, so an application's divider and error outlet show only with the button.

### What happens at each callback

- **`handleClick`:**
  - the privacy-and-terms gate (`TermsNotAccepted`);
  - a refusal while another payment holds the lock.

  Answered at once with nothing awaited, because the wallet opens its sheet only inside the click's gesture.
- **`onAuthorized`:**
  - the payment lock, `setCollecting`;
  - the gift cards, through `authorizeWalletGiftCards`, as for Braintree's wallets.

  A refused gift card answers `{ continue: false }` with its message and releases the lock, so the wallet is never charged after a gift card failed. A button that has unmounted refuses too.
- **`onPaymentCompleted`:** the payment id is written into the session with `recordCheckoutComPayment`, then `done`. If the write fails, the outcome is `failed` with `payment_not_recorded`, and nothing is rolled back.
- **`onError` during a payment:** `failed`, with Checkout.com's decline reason or error code. Outside a payment it only shows.

A wallet payment that ends in a redirect comes back through `useCheckoutComRedirectResume`, like a card's.

### The lock waits for `onAuthorized`

Braintree's Google Pay takes the lock on the click and releases it when Google reports the sheet cancelled. Checkout.com reports nothing. A lock taken on the click would stay after every sheet the shopper closed, and the payment method could never be changed again.

So the lock starts at `onAuthorized`, when there is something to protect. Between the click and the confirmation the shopper can still switch method. Nothing has been charged yet, and a sheet confirmed after its button went away is refused.

### Apple Pay is built, not mounted

`<PaymentSettingCheckoutComApplePay>` is the same implementation with `applepay`. Its button renders on any Safari that can pay, and the payment fails unless the checkout's domains are registered for Apple Pay on the Checkout.com account. An application mounts it only once that is done, which is what mfe-checkout's comment says.

## Consequences

- **Where the shared code lives.** Checkout.com's error mapping, sandbox detection and error shape moved to `utils/checkoutCom.ts`, shared by the card form and the wallets. The implementation behind the two exported components sits in `components/utils/`, which the public API guard treats as internal; its prop types are exported by hand.
- **Not verified on a real payment:**
  - whether `vaulting: true` stores a wallet payment;
  - whether a wallet payment can redirect;
  - whether `onAuthorized`'s `errorMessage` keeps Google's sheet open.

  The first completed Google Pay payment answers all three.
- **No end-to-end test can complete a wallet payment** headless. mfe-checkout covers that the button renders, that the terms gate keeps the sheet closed, and that closing the sheet leaves the card form able to pay.
