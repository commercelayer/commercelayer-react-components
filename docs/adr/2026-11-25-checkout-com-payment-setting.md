# Checkout.com as a payment setting: the card component, paid from our button

**Date:** 2026-11-25
**Status:** accepted — run in the browser on staging on 2026-11-25
**Scope:** `<PaymentSettingCheckoutComPayment>` and `useCheckoutComRedirectResume`, for
`payment_setting_checkout_coms` on the `payment_sessions` model: one-time card payments, 3DS and
saving the card. Paying with a stored card is out of scope, as for every gateway. Wallets and the
other methods Flow offers are out of scope too: see below. The `payment_source` model's
`<CheckoutComPayment>` is untouched.

## Context

Verified against the API and the sandbox before writing any of it, with the payments playground's
Checkout.com integration (payments-api-playground#20) as the reference:

- **The session creates a Checkout.com payment session.** `POST payment_sessions` makes the API
  request one from Checkout.com straight away, and returns it whole in `response_data`: `id`,
  `payment_session_secret`, `payment_session_token`. Checkout.com's web components
  (`@checkout.com/checkout-web-components`) are built from that object. The setting carries the
  browser credential, `public_key`.
- **Checkout.com refuses a session without return URLs.** `client_data.success_url` and
  `failure_url` are required on every session, whether or not it will redirect.
- **The browser pays, the API reads.** The web components submit the payment to Checkout.com
  themselves. The API learns of it only when its id, `pay_…`, is written into the session's
  `client_data.payment_method`. The Payment Authorization then reads that payment from Checkout.com
  instead of submitting a new one (`express?` in the API's Checkout.com session), and takes its
  status from it: `Authorized` or `Captured` succeed, `Declined` fails, `Pending` waits for the
  webhook. Without a payment id the authorization does nothing.
- **Every sandbox payment comes back through a redirect.** With 3DS on the session, the card
  component runs the challenge in Checkout.com's modal and then sends the shopper to `success_url`
  or `failure_url`, frictionless or not. Checkout.com appends `cko-payment-id` and its session ids
  to either URL. `onPaymentCompleted` is raised only for a payment that completes without an
  asynchronous step, which on these settings is none.
- **Saving the card asks no one.** `vaulting: true` makes the API create the Checkout.com payment
  session with card storage enabled, and the authorization links the `payment_wallet`. Neither Flow
  nor the card component asks the shopper for consent.

## Decision

### The card component, not Flow

Flow renders every method the Checkout.com account has on: cards, but also Apple Pay, Google Pay,
PayPal and local methods. Those come with a pay button of their own, which `<PlaceOrderButton>`
cannot press, and `submit()` is not available for them. Offering them means a **Gateway-Owned
Button** per method, the gift cards charged inside each wallet's `handleClick`, and a way to swap
the collection when the shopper switches method inside Flow — none of which can be tested end to
end, since a headless browser has no wallet.

The card component has no pay button and no other method. So the first version mounts that, and
wallets are a later decision with their own issue.

### `<PlaceOrderButton>` is the pay button

The card component is created with `showPayButton: false` and registers a **host collection**:

1. The place button charges the gift cards, then calls `submit()`.
2. An incomplete form is a stop, `incomplete`. `submit()` is still called, because that is what
   makes the component show which fields are missing; the Submit error it raises is ignored.
3. Otherwise the component submits the payment and the collection waits on Checkout.com's
   callbacks, since `submit()` itself returns nothing:
   - `onPaymentCompleted` writes the payment id into the session, then settles `completed`. The
     place sequence creates the authorization, which reads that payment.
   - `onError` settles a decline (`payment_request_declined`) or an abort as `failed`, with
     Checkout.com's decline reason as the code, and anything else as `unknown`.
4. `isCollecting` is set for the whole window, so the shopper cannot switch method mid-payment.

A payment Checkout.com approved but the API was not told about is the one outcome where money moved
and nothing records it. It is settled `unknown`, and the next click retries the write instead of
calling `submit()` again, which would charge the card twice.

### The return is the main path, resumed from the URL

Since 3DS redirects on every payment, `useCheckoutComRedirectResume` carries most payments, from
`<PaymentSetting>` like the other gateways' resumes:

- **Success:** write `cko-payment-id` into the session, report the collection `done`, and let
  `<PlaceOrderButton>` place the order out of band. Whether the payment really succeeded is decided
  by the authorization, which reads it from Checkout.com.
- **Failure:** report `failed` and record nothing. A declined payment written into the session would
  only produce a failed authorization.

The two are told apart by `checkout_com_return=success|failure`, a parameter of ours on the two
URLs. Checkout.com appends the same payment id to both, and the payment itself cannot be read from a
browser: that takes the secret key. The parameter and Checkout.com's own are stripped by
`buildGatewayReturnUrl`, so a later session never carries a spent return.

The URLs are built from `<PaymentSetting>`'s `returnUrl` when the application gives one, for the
reason Adyen's are: a checkout whose credentials live in the query string keeps them out of a URL
handed to a gateway.

### Consent is the application's

Checkout.com is added to the settings whose payment form cannot ask, so `canSaveCard` is offered to a
signed-in customer and the choice becomes `vaulting` at session creation, as for Stripe. Changing it
replaces the session, and the card form remounts on the new Checkout.com payment session: a
component cannot be moved from one to another.

## Consequences

- Checkout.com sits among the implemented settings, and is skipped like Stripe when the setting has
  no `public_key`.
- `useStickySessionValue` is generic now, because the value read out of a Checkout.com session is the
  whole payment session, not a string.
- Saving the card does not end in a `payment_wallet` yet. On 2026-11-25 the session vaulted and
  Checkout.com stored the card, but no wallet was linked to the session when the payment came back
  through a 3DS redirect, which on the sandbox is every payment. The library sends what it should,
  and the end-to-end test for it waits as `fixme`.
- Paying with a stored card waits for the general "pay with a stored payment wallet" work. When it
  comes: the API submits that payment itself, the authorization waits in `requires_action` with a
  redirect, and the return carries `cko-session-id` with no payment id. The resume already leaves
  such a return alone. A session bound to a `payment_wallet` must never mount the card form, which
  would charge the stored card.
- An order that creates a subscription does not force `vaulting` here, as it does not on the other
  gateways yet. That belongs to the subscriptions work on this model.
