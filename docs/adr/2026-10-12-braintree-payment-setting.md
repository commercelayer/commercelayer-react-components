# Braintree cards: Hosted Fields, 3DS in the browser, the charge in the authorization

**Date:** 2026-10-12
**Status:** accepted
**Scope:** `payment_setting_braintrees` through Braintree's Hosted Fields and 3D Secure, on the
`payment_sessions` model, cards only. Apple Pay and Google Pay are the next iteration.

## Context

The third card gateway, after Adyen and Stripe, and the first whose charge happens server-side.
Read from `core-api` (`master` at `c9a90b2c6`, where the new payments are on the default branch
since the production beta) and from the payments playground, then verified against the API with a
sales-channel token, before writing any of it:

- **The setting carries no browser credential.** `payment_setting_braintrees.public_key` is
  readable, but it is half of the API key pair Commerce Layer charges with
  (`PaymentSettingBraintree#query` sends `public_key:private_key` as basic auth). There is no
  tokenization key.
- **The session carries a Client Token.** `Payment::Session::Braintree#create_client_token` calls
  Braintree's GraphQL `createClientToken` with only `merchantAccountId` and stores
  `response_data: { clientToken }` — the same value as the session's `token`. No customer, so no
  stored cards are offered either.
- **The nonce goes on the session, and the authorization charges.** `client_data.payment_method_id`
  is the only place it is read from (`Payment::Payload::Braintree#payment_method_id`); a `PATCH`
  stores it and calls nobody. Creating the Payment Authorization runs `authorizePaymentMethod` — or
  `chargePaymentMethod` with `auto_capture` — in a background job.
- **Commerce Layer makes no 3DS check.** No 3DS parameter in the payload, no liability-shift check,
  no `requires_action`, and `_payment_details` and `_refresh` do nothing for Braintree.
- **No session `vaulting`.** `session_vaultable?` is false; `vaulting: true` is a 422 without a
  gateway call. Saving a card would go through `payment_wallets` instead.
- **Measured on stg1:** a session is `201` with `response_data.clientToken`; the token's
  `authorizationFingerprint` is a JWT expiring **24 hours** after creation, while the session's
  `expires_at` is **48 hours** out. `PATCH client_data` is `200`; the authorization is `201
  pending` and reaches `succeeded` within two seconds, with `payment_instrument` filled
  (`card_type`, `card_last_digits`, `card_expiry_*`). A session carrying an authorization cannot be
  deleted (`423`).
- **Declines are by amount.** The sandbox declines 2000.00–2999.99 as `PROCESSOR_DECLINED`, which
  lands as `declined` with the session left `unpaid`. `fake-processor-declined-visa-nonce` is
  **charged** through the GraphQL API — it is not a way to test a refusal here.
- **A second authorization on an authorized session is accepted** (`201`) and stays `pending` for
  good. The place sequence's `needsAuthorization` already prevents it; worth knowing for any new
  caller.

## Decision

### Hosted Fields, not the Drop-in, loaded at run time

`braintree-web` was already a dependency, for the `payment_source` model's `BraintreePayment`, and
it is loaded the same way: a dynamic `import()` of `client`, `hosted-fields` and `three-d-secure`,
so it stays out of the bundle of every checkout that never offers Braintree and adds nothing to
`package.json`. `braintree-web-drop-in` is not added. Unlike Adyen's and Stripe's, Hosted Fields
give us the containers rather than a whole form, so the component renders a default layout — number,
then expiry and CVV side by side, cardholder name on request — and takes labels, Braintree's iframe
styles and class names for its parts, which is the shape mfe-checkout already styles for the older
gateway.

### `<PlaceOrderButton>` is the pay button, and `submit` runs to the verdict

The component registers a **host collection**, as Adyen's and Stripe's cards do, so the
privacy-and-terms gate and the gift-card ordering are untouched. What `submit` does is longer, because
the money only moves at the end:

1. `hostedFields.tokenize()`;
2. `threeDSecure.verifyCard()` — the challenge opens in Braintree's (Cardinal's) modal, in place;
3. `PATCH client_data.payment_method_id` with the nonce 3DS returned;
4. `POST` the Payment Authorization and poll it until it leaves `pending`.

Steps 3–4 are `authorizeBraintreePaymentSession` in core-components. Waiting for the verdict inside
`submit`, rather than leaving the authorization to `placeOrderWithPaymentSessions`, is what keeps the
handoff's contract: `completed` means money taken, and a refusal comes back as a **verdict** the
button can act on — rather than as a placeability error that cannot tell a declined card from a
payment rule.

| Braintree / Commerce Layer says                         | Reported as    | Why                                                       |
| ------------------------------------------------------- | -------------- | --------------------------------------------------------- |
| `HOSTED_FIELDS_FIELDS_EMPTY` / `_INVALID`               | `incomplete`   | The shopper has not finished; the reason goes to children |
| any other tokenize error                                | `failed`       | Nothing has left the browser                              |
| `verifyCard` throws, or the liability shift is refused  | `failed`       | No nonce has reached Commerce Layer                       |
| `PATCH` refused, or the authorization `POST` refused    | `failed`       | The API refused; no authorization exists                  |
| authorization `succeeded` or `processing`               | `completed`    | `processing` is `SUBMITTED_FOR_SETTLEMENT` (auto-capture) |
| authorization `declined`, `failed`, `canceled`, …       | `failed`       | Braintree's verdict                                       |
| authorization `POST` without an API error (transport)   | `unknown`      | The job runs whether or not the response reached us       |
| still `pending` after 30 polls of 1s                    | `unknown`      | Commerce Layer leaves it there when its gateway call raised |

The decline reason is not available: Braintree's answer is in the authorization's `response_data`,
which is withheld from storefront tokens. The authorization status is the code.

### 3DS is enforced in the browser, leniently by default

Commerce Layer authorizes whatever nonce it receives, so this component is the only place a 3DS
outcome can be enforced. A shopper who **could** have authenticated and did not
(`liabilityShiftPossible && !liabilityShifted`) is refused. A card for which 3DS was **not possible**
— not enrolled, an issuer that did not answer — goes ahead, Braintree's own default and the
playground's choice; `requireLiabilityShift` makes that a refusal too. `threeDSecure={false}` exists
only for a merchant account without 3DS, where creating the instance fails.

`verifyCard` is given the **session's** amount (`amount_float`, falling back to `amount_cents / 100`),
not the order total the older `BraintreePayment` sends: with gift cards applied the card pays only the
remainder, and authenticating a different amount from the one charged is what the issuer's risk check
is there to notice. Email and billing address go with it, for the frictionless rate.

### An expired Client Token renews the session, once

A checkout reopened the next day adopts a session whose token Braintree refuses — the token lives a
day, the session two, and nothing regenerates the token. The reuse predicate cannot see it without
decoding Braintree's token format, so the component reacts instead: when `client.create` fails it asks
`<PaymentSetting>` for a fresh session through `renewPaymentSession`, which is `selectSetting` with
the reuse skipped. The stale session is cleared like any superseded selection.

Once per mount, not once per session: every renewal is a new session, so a per-session allowance
would loop forever on an account that refuses every token. A form still standing after the renewal
reports the error.

### The client token is remembered across a refetch

For the reason Stripe's client secret is: a refetch whose `fields` omit `response_data` must not
unmount the form mid-typing. The logic Stripe had inline is now `useStickySessionValue`, shared.

## Consequences

**Three gateways, one handoff.** The button, the gate and the gift-card ordering needed no change
again. The difference Braintree introduces — the charge happens server-side — fitted inside `submit`.

**A declined card shows a raw code on the order.** The button writes `gatewayError(code)`, and the
code is `declined`. The component's own errors carry English copy and the code in `meta.error`, but
the order-level message is what the shopper sees after a refusal, because the burnt session takes the
form away. Translating it is the application's: mfe-checkout does not yet, for any gateway.

**A refusal costs the shopper the form.** A burnt session is discarded (or, at `423`, abandoned), the
selection empties, and the shopper picks Braintree again — on a new session, with a new token. A 3DS
failure does the same, although that session was not burnt: the handoff has no outcome for "refused,
but the session is fine", and adding one for Braintree alone was not worth the asymmetry.

**Duplicate checks bite tests.** Braintree's sandbox rejects the same card for the same amount within a
short window (`GATEWAY_REJECTED`, which lands as `failed`). Every fixture order costs the same, so the
end-to-end tests use a different card per test.

**Not in this iteration:** saving cards (no session `vaulting`; a `payment_wallets` flow would be
needed), PayPal and Venmo through Braintree, and Apple Pay / Google Pay — which Commerce Layer would
authorize as any other nonce, but whose `payment_instrument` comes back empty, since
`Payment::Instrument::Braintree` knows only cards, PayPal, Venmo and US bank accounts.
