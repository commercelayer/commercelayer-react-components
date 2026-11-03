# Google Pay through Adyen: the gift cards move off the click

**Date:** 2026-09-07
**Status:** accepted
**Scope:** Google Pay offered inside the Adyen Drop-in, on the `payment_sessions` model

## Context

`2026-09-07-paypal-through-adyen.md` established the **Gateway-Owned Button**: a method whose
own control performs the payment, where `<PlaceOrderButton>` cannot collect and the
privacy-and-terms gate moves inside the method's own click. Google Pay is the second instance,
and it was chosen over Apple Pay for one reason — it is the one we can actually run. Apple Pay's
`isAvailable()` rejects unless the document is `https:`, and it needs Safari with a card in
Wallet, which Playwright's WebKit is not and does not have.

So the question this ADR answers is not "how do we add a wallet". It is whether the pattern
generalises, or whether it was shaped around PayPal.

Verified against the installed `@adyen/adyen-web@6.42.0` and the real `/sessions/{id}/setup`
response, not the docs:

- **Nothing to configure.** Adyen's setup response already carries
  `googlepay.configuration = { merchantId, gatewayMerchantId }`. Unlike `applepay` it carries no
  `merchantName`, which Google shows in its sheet; left unset it is empty.
- **Google renders the button.** `componentToRender` gates on `showPayButton`, and passes
  `onClick: this.submit` to `paymentsClient.createButton()`. The Core sets `showPayButton: false`
  so cards route through our button, so Google Pay needs it re-enabled per method, exactly as
  PayPal does.
- **`submit` works** — `new Promise((resolve, reject) => props.onClick(resolve, reject)).then(showGooglePayPaymentSheet)`.
  Its `onClick` takes its callbacks **positionally**, not as PayPal's actions object.
- **`onAuthorized` exists**, and fires between the shopper choosing a card and the money moving:
  `handleAuthorization().then(this.makePaymentsCall)`. `formatProps` appends
  `PAYMENT_AUTHORIZATION` to `callbackIntents` unconditionally, so the hook is always live.
- **`isAvailable()` is `isReadyToPay()`**, with `existingPaymentMethodRequired: false` by default
  and no protocol guard — so the row renders on the dev server, in Chromium.

## Decision

### Google Pay owns its button, even though `submit` works

`submit` resolving our `onClick` and then calling `loadPaymentData()` looks like host-drivability.
It is not, because Google requires `loadPaymentData()` to happen inside the click's user gesture,
and the place sequence charges the gift cards before it asks anyone to collect. The gesture window
is finite and a network round trip can exceed it, at which point the sheet does not open.

That ordering is not negotiable — a refused payment must never leave gift cards charged after it —
so the method goes where PayPal went. Which corrects the earlier claim that the wallets were "an
easier problem": for a wallet the deciding question is the gesture, not the API.

### The gate on the click, the gift cards on `onAuthorized`

The two halves of PayPal's `onClick` split here, and each lands where it can work.

The **gate** stays on the click and does no I/O: it reads `collectionPermitted` from a ref,
reports and rejects, or resolves. It has to be on the click because its job is to stop the sheet
from ever opening, and it can be because it needs nothing from the network.

The **gift cards** move to `onAuthorized`, which is strictly better than the click ever was:

- no gesture to preserve, so no race to lose intermittently;
- still before the money — `/payments` is called only once it resolves;
- and a rejection reaches the shopper where they are standing. Whatever we reject with becomes
  Google's `PaymentDataError`: a string is shown verbatim **inside Google's own sheet**, which
  stays open for another attempt. A gift card that cannot be charged no longer costs the shopper
  the wallet flow.

**It is not an argument for moving PayPal there, and that was checked** — the first draft of
this ADR called it the obvious next simplification, wrongly. `Paypal.js#handleOnApprove` reads:

```js
if (!onAuthorized) { this.handleAdditionalDetails(payload); return }   // today's path
if (!actions.order) { this.handleError("PayPal order actions are not available"); return }
return actions.order.get()
  .then(order => new Promise((resolve, reject) => onAuthorized({ ... }, { resolve, reject })))
  .then(() => this.handleAdditionalDetails(payload))
  .catch(e => this.handleError("Something went wrong while parsing PayPal Order", { cause: e }))
```

Providing the hook makes the payment conditional on `actions.order`: without it
`handleAdditionalDetails` is never reached and the payment does not complete — a failure mode
the current path does not have. Worse, a deliberate rejection is indistinguishable from a parse
failure, because both land in that one `catch` and arrive as `onError`. Every `onError` is an
**unknown** outcome by this library's own rules: nothing may be rolled back, and the shopper is
shown Adyen's message about parsing rather than ours about their gift card.

Google Pay's rejection value, by contrast, becomes Google's `PaymentDataError` and is displayed
verbatim in a sheet that stays open.

And there is nothing to buy. The gesture is why Google Pay's gift cards had to move; PayPal has
no gesture problem, because zoid pre-opens the popup on the click. The click is also the better
moment for the shopper: a gift card that cannot be charged aborts before the popup opens, rather
than after they have signed in to PayPal and approved a payment.

So the placement is per-method for reasons per method, and the asymmetry is the design.

### A rejected `onAuthorized` is not a refusal

Adyen routes it through `handleFailedResult`, which calls `onPaymentFailed` — the same callback a
real refusal arrives on. Read as a refusal it would burn the Payment Session, and that is exactly
wrong: no money moved, and the shopper is still in Google's sheet able to pick another card. The
session _is_ the payment, so discarding it would break the retry Google is offering.

So a flag marks our own abort, is consumed by the handler, and is reset on every click — a flag
that outlived its attempt would swallow a real refusal. Both directions are pinned by specs, and
both fail without the guard.

**`onPaymentFailed` therefore no longer means "the gateway refused".** It means "this attempt
ended without money", and who ended it decides what may be rolled back.

### The gate is reported, because there is nothing else

PayPal's `onInit` hands over `enable()`/`disable()`, so its button can render disabled. Google's
`createButton()` offers no equivalent. There is no disabled state to render, which means the
message produced on the click is the _only_ thing between a shopper and a control that appears to
do nothing. The decision to report the closed gate rather than merely enforce it — added for
PayPal after a manual run — is what makes Google Pay viable at all.

### A row in the list, not an instant payment

Adyen can hoist wallets above the method list via `instantPaymentTypes`. Kept as an ordinary row:
`collection.by` is switched from the Drop-in's `onSelect`, and a hoisted button is unlikely to
emit one. A second presentation is not worth a second mechanism for deciding who collects.

### `"google_pay"`, not `"googlepay"`

The public `paymentMethods` union is our vocabulary, not Adyen's tx-variants — `"card"` is
already not `"scheme"`. It is in the defaults, like every method as it lands, and the override
narrows only.

## Consequences

**The pattern generalised, and gained a seam.** `OWNS_ITS_BUTTON` and the out-of-band collection
carried over untouched. What did not carry over is where gift cards are charged, which is now a
per-method question with a name — see **Gift Card Moment** in `CONTEXT.md`.

**Three shapes of gateway callback now coexist.** PayPal's `(data, actions)`, Google Pay's
positional `(resolve, reject)`, and Adyen's own Core callbacks. Adyen under-declares the first and
declares the second; neither is guessable, and an `adyen-web` upgrade should not land without the
end-to-end tests for both.

**The sheet has no merchant name.** The session carries none for `googlepay`. If it matters, a
prop is the place for it — the library cannot know it.

**The payment itself is untested, and the interesting part is not.** Completing a Google Pay
payment needs a signed-in Google account with an allowlisted test card, which Playwright has no
profile for. The e2e stops where the sheet opens — which is precisely the assertion that the
gesture survived, the one thing about this design that could have been wrong. What remains
unverified is the leg after Google returns a token, and that leg is the card path.

**One caveat on that test.** It proves the sheet opens under the current design; it does not
prove the asynchronous version would fail. On an order without gift cards the round trip is fast
enough that both would pass. The reason to keep the gate synchronous rests on Google's
requirement, not on this test — which is why the requirement is written down here.
