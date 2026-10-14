# PayPal through Braintree: the card's server path, Adyen's PayPal button

**Date:** 2026-10-13
**Status:** accepted — unit-tested, verified server-side, and run end to end in the browser on
2026-10-14
**Scope:** `<PaymentSettingBraintreePayPal>`, one-time PayPal payments on the `payment_sessions`
model. Saving a PayPal account (vault flow, billing agreements) is out of scope, blocked on the same
missing session `vaulting` as Braintree cards.

## Context

**Commerce Layer needs nothing new.** Verified on stg1 with a sales-channel token and Braintree's
sandbox nonce `fake-paypal-one-time-nonce`: the session is the card's (same client token, no
`client_data` on create), the nonce goes in `client_data.payment_method_id`, and the authorization
goes `pending → succeeded` in about a second through the same `authorizePaymentMethod`. Commerce
Layer then fills `payment_instrument` with `{ account_email, account_id }` from the transaction's
`PayPalTransactionDetails.payer` (`Payment::Instrument::Braintree::PayPal`) — so unlike Apple Pay,
the recap can name what paid.

**The browser needed a linked account, and said so.** The sandbox merchant's configuration has
`paypalEnabled: true`, and `paypalCheckout.create` still fails with
`PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED`: a Braintree sandbox needs a PayPal sandbox business account
linked in its Control Panel before PayPal's SDK can be loaded. Sandbox nonces do not, which is why
the server-side check passed.

## Decision

### Adyen's PayPal pattern, Apple Pay's placement

PayPal is a **Gateway-Owned Button** here as everywhere: its popup needs the click on its own
button. So, as with PayPal through Adyen:

- **`onClick`** holds the privacy-and-terms gate and the gift cards. PayPal awaits it before the
  popup goes on, so a round trip is fine there and a rejection closes the popup before the shopper
  has done anything in it — the **Gift Card Moment** for PayPal, unchanged.
- **`onApprove`** turns the approval into a nonce (`tokenizePayment`) and hands it to
  `authorizeBraintreePaymentSession`, as the card does, then reports an **Out-of-Band Collection**:
  `in-progress`, then `done` or `failed`. `<PlaceOrderButton>` places the order without a click.
- **`onCancel`** moves nothing: the gift cards charged on the click stay charged and applied, as
  after any interrupted payment.

And, as with Apple Pay through Braintree, it is a component of its own beside the card fields, with
both routes live — the card through `<PlaceOrderButton>`, PayPal through its button — rather than a
selection that disables the place button.

### `intent: "authorize"`, whatever the setting does with the money

Braintree loads PayPal's SDK and creates the payment for one intent. An approval made for
`authorize` can be charged straight away (`chargePaymentMethod`, with `auto_capture`) or authorized
(`authorizePaymentMethod`, without), while one made for `capture` refuses a plain authorization. So
`authorize` is the one that works for every setting. The SDK is loaded in the session's currency,
and the payment created for the session's amount — the remainder after the gift cards.

### PayPal's SDK under a namespace of its own

`braintree-web` loads PayPal's JS SDK as a script that defaults to the `window.paypal` global, and so
does the Adyen Drop-in for its own PayPal, with Adyen's client id. Two scripts writing one global
leave whichever loaded last driving both — reachable in mfe-checkout, which offers both settings.
`braintree-web` passes `dataAttributes` to the script as `data-*` and never reads the global itself,
so `data-namespace` puts Braintree's SDK under `commercelayerBraintreePayPal` and the two stay
apart.

### Not offered is silent

When Braintree will not create PayPal (not enabled, not linked) or PayPal says the buyer is not
eligible, the component renders nothing — no container, no children — and warns in development
with Braintree's code. That warning is how `PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED` was found.

## Consequences

**The browser run passes.** mfe-checkout's `payment-sessions-braintree-paypal.spec.ts` covers
rendering, the terms gate, a full payment and a gift-card split, and reads the payer's email back
from `payment_instrument`. All four passed on 2026-10-14, once the account was linked. The buyer
comes from `NP_BRAINTREE_PAYPAL_*` with a fallback to `NP_PAYPAL_*`; the Adyen sandbox buyer in
the latter was accepted, so the Braintree-specific pair is not needed today. PayPal's SDK mounts
three iframes in the button's container, so the spec targets `iframe.component-frame`.

**Linking PayPal broke session creation, server-side.** Commerce Layer stored the whole client
token as the session's `token`, under a unique btree index whose rows are capped at about 2704
bytes. Tokens were 2528 characters with PayPal unlinked; linking adds PayPal's configuration to
them, and every Braintree session create then failed with a `500 INVALID_QUERY`. Fixed in
`core-api` on 2026-10-14. Nothing changed here: the component reads the client token from
`response_data.clientToken` only. What did change, found through it, is how a failed selection
is reported — see `PaymentSetting.tsx`'s `selectionError`, scoped to the setting that failed.

**mfe-checkout groups Braintree's wallets.** Apple Pay and PayPal sit in one block above the card
fields with a single "or pay by card" divider, shown only when the block has something in it — so a
browser with neither shows the card fields alone.
