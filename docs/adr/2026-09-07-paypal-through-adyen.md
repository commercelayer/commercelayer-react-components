# PayPal through Adyen: the gate moves to the method's own click

**Date:** 2026-09-07
**Status:** accepted
**Scope:** PayPal offered inside the Adyen Drop-in, on the `payment_sessions` model

## Context

`2026-09-02-adyen-payment-setting.md` shipped cards through Adyen's client-side Drop-in and
restricted it to them with `allowPaymentMethods: ["scheme"]`. PayPal is the first method to be
added, and it breaks the property the whole design was built on: **`<PlaceOrderButton>` is the
pay button.**

That property is what keeps a legally required privacy-and-terms gate in front of every
payment. It works for cards because a card form is inert until something submits it. PayPal
is not inert: its own branded button performs the payment, and it must, because the browser
requires a real user gesture to open a popup and PayPal's presentation rules require their
button to be the thing clicked.

So this is not "one more method". It is a second answer to the question _who owns the click_,
and the gate has to move to wherever that is.

### The reason the earlier ADR gives for the restriction is wrong

It says Apple Pay, Google Pay and PayPal _"render their own pay buttons and submit
themselves, which would bypass `<PlaceOrderButton>` and the terms gate"_. Half of that is
right and the operative half is not.

`showPayButton: false` — which the card integration sets on the `Core` — does not hide
PayPal's button. `Paypal.componentToRender()` returns `null` when it is false
(`src/components/PayPal/Paypal.tsx:243`), and that is the only thing `UIElement.render()`
renders. The PayPal SDK script is never even downloaded. In the Drop-in, PayPal would still
appear as a selectable row with **an empty accordion panel** underneath.

So the restriction was correct and its stated reason was not: it was preventing a broken
render, not a bypassed gate. That correction is applied to the earlier ADR.

The same is true of Apple Pay, Google Pay and Amazon Pay — all four return `null` rather than
degrading like Card, which always renders its form and gates only the button inside it
(`Card.tsx:214` vs `CardInput.tsx:613`).

### Out of scope, and the reason has changed

- **Apple Pay and Google Pay.** Deferred, but no longer for the reason the earlier ADR gives.
  Their buttons' `onClick` **is** `this.submit` (`ApplePay.tsx:356`, `GooglePay.tsx:320`), so a
  host button _can_ drive them — they are a different and easier problem than PayPal, and
  designing for PayPal first would over-build for them. PayPal is the only method in the set
  that categorically cannot be host-driven.
- **Klarna.** Still blocked in `core-api`: the Adyen session payload sends nine keys and none
  of them is `lineItems`, which Klarna requires, and the only extension point — `options` — is
  `prohibited: [read, write]` for a sales-channel token. Nothing has changed there since the
  card work.
- **PayPal as an express button** (product page, before an order exists). Unchanged from the
  earlier ADR: blocked on reading `public_key` without an order.

### What `adyen-web` actually does

Verified against `6.42.0`, the installed version.

**`dropin.submit()` can never drive PayPal.** Not a configuration — an override:

```ts
// src/components/PayPal/Paypal.tsx:78
public submit = () => {
    this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
};
```

A class-property arrow, so it shadows `UIElement.prototype.submit` unconditionally and cannot
be reached through `super`. It is in the public typings (`index.d.ts:3630`), so it is
intentional. `handleSubmit` — the real entry point — is `private` and is only ever called by
PayPal's SDK as `createOrder`. `updateWithAction` is public but guards with
`WRONG_INSTANCE` unless the button already started the flow. **There is no programmatic
trigger.**

**Two hooks reach PayPal's own click, and both are forwarded verbatim.**
`Paypal.componentToRender` spreads its props into `PaypalComponent`, which spreads them into
`PaypalButtons`, which passes `onInit` and `onClick` straight into `paypal.Buttons({...})`
(`PaypalButtons.tsx:32-45`). So they are PayPal's callbacks, not Adyen's:

```ts
// @paypal/paypal-js@10.0.2 types/components/buttons.d.ts:232
export type PayPalButtonOnClick = (
  data: Record<string, unknown>,
  actions: OnClickActions,
) => Promise<void> | void;

export type OnClickActions = {
  reject: () => Promise<void>;
  resolve: () => Promise<void>;
};
export type OnInitActions = {
  enable: () => Promise<void>;
  disable: () => Promise<void>;
};
```

`actions.reject()` aborts before the popup opens and before any Adyen call. And `onClick` may
return a promise, so it may do work first — which is what makes it usable for more than a
boolean check.

**Adyen under-declares `onClick`.** `PayPalConfiguration.onClick?: () => void`
(`index.d.ts:3556`) — no parameters. The real signature comes from PayPal's SDK, above. A cast
is required, and the version has to be pinned.

**`beforeSubmit` is not the gate, and using it is worse than not gating.** It runs inside
`makePaymentsCall`, i.e. _after_ PayPal's popup is already open. And rejecting it lands in
`Paypal.handleSubmit`'s catch:

```ts
// src/components/PayPal/Paypal.tsx:197
.catch((e) => {
    if (e instanceof CancelError) {
        this.setElementStatus('ready');
        return;                              // ← neither resolve nor reject
    }
```

That early return settles neither half of the promise handed to `createOrder`, so **the PayPal
popup hangs on a spinner indefinitely.**

**`beforeRedirect` never fires for PayPal.** It lives only in `RedirectShopper`, reached only
from `action.type === 'redirect'`. PayPal's action is `'sdk'`, and `Dropin.handleAction`
short-circuits every non-`redirect` action to `updateWithAction` first (`Dropin.tsx:199`).
`onActionHandled` does fire — `actionDescription: 'sdk-loaded'` — but after the popup is
already open, and it returns `void`. **Neither is a "we are about to leave the page" hook, and
Adyen has none:** PayPal decides overlay-versus-redirect inside its own SDK.

**The flow is two Adyen calls, both from inside PayPal's lifecycle.**
`createOrder` → `POST /sessions/{id}/payments` → Adyen answers `action.type: 'sdk'` →
`updateWithAction` resolves the token → PayPal takes the shopper through approval → `onApprove`
→ `POST /sessions/{id}/paymentDetails` → `onPaymentCompleted`.

**`Pending` and `Received` arrive as success.** `verifyPaymentDidNotFail` is a _deny_-list:

```ts
// src/components/internal/UIElement/UIElement/utils.ts:54
if (["Cancelled", "Error", "Refused"].includes(response.resultCode))
  return Promise.reject(response);
```

So `onPaymentCompleted` fires for a delayed-settlement PayPal payment, and firing is no longer
the same thing as money taken.

**Cancel and refusal arrive on different callbacks, and the discriminator is fragile.**
Closing the overlay produces `onError` with `new AdyenCheckoutError('CANCEL')` and **no
message** (`Paypal.tsx:253`); a refusal produces `onPaymentFailed` with a `resultCode`. But a
script-load cancellation also uses `name === 'CANCEL'`, with the message `'Script loading
cancelled.'` — so the two separate only on an undocumented empty-message convention. And a
refusal can be followed by a spurious `onError('ERROR')`, because `handleSubmit` rejects
`createOrder` after `handleFailedResult` has already run.

**Two smaller facts worth recording.** PayPal is never an `instantPaymentTypes` member
(`SUPPORTED_INSTANT_PAYMENTS = ['paywithgoogle', 'googlepay', 'applepay']`, `Dropin.tsx:16`),
so it is an ordinary accordion row and its buttons appear one click deeper than the wallets'.
And `locale` is **not** in `GENERIC_OPTIONS`, so it never reaches PayPal from the Core config:
PayPal auto-detects the shopper's language instead of following the checkout, unless it is set
per method from a 24-entry allow-list.

### What the API actually does

Verified in `core-api` at `65c08cc73`.

**The fall-through the card work rested on is gone, and the replacement is better.**
`2c1145339` rewrote it. `#authorize!` now has both the status check it lacked _and_ a guard:

```ruby
# app/models/payment/session/adyen.rb:82
def skip_authorize?
  session.payment_wallet.blank? && client_data['payment_method'].blank?
end
```

Our Drop-in charges client-side, so there is no wallet and no `client_data['payment_method']`:
`authorize!` returns immediately, **no `/payments` call is made at all**, the authorization stays
`pending`, and the `AUTHORISATION` webhook succeeds it. Same outcome as before, reached without
ever talking to Adyen — and now pinned by an upstream spec, _"does not call Adyen and leaves the
authorization pending, waiting for the webhook"_. Assumption 2 of the earlier ADR is retired.

**In exchange there is a tripwire, and it is one PayPal invites.**
`client_data.payment_method` is `creatable`/`updatable` for a sales-channel token with no
`prohibited` key. Writing it — to record which method the shopper picked, for a recap or for
analytics, which is exactly what one wants with PayPal — flips `skip_authorize?` to `false`.
Commerce Layer then calls `/payments` with it, Adyen answers 422, and the new `apply_response`
puts the authorization in **`failed`**. From there `succeed` is illegal, `509bbb9a1` added
`succeeded → failed` with `invalidate_session!`, and the session lands in the new `invalidated`
state, which is in `CLOSED_STATES` and blocks new transactions. **Unrecoverable, and silent.**

**Four gaps a storefront-only PayPal integration cannot close.** None blocks the happy path;
each leaves a hole.

1. **`options` is `prohibited: [read, write]` for a sales-channel token**, and
   `payload.merge!(options.deep_symbolize_keys)` is the _only_ extension point on the
   `/sessions` payload. So `lineItems`, `shopperEmail` and a bare `shopperReference` cannot be
   sent from a storefront at all. This one sits underneath the other three.
2. **`PENDING` and `OFFER_CLOSED` webhooks are discarded.** Neither is in
   `Response::AdyenEvent::Standard::CODES`, so the handler's constructor raises
   `UnsupportedEventType` — inside a Sidekiq job with `retry: 0`, after the controller has
   already answered `200 "[accepted]"`. A delayed PayPal payment therefore has **no resolution
   path**: the authorization stays `pending` forever.
3. **`payment_session.payment_instrument` is always `{}` for Adyen.** `Payment::Session::Adyen`
   overrides neither `payment_data` nor `refresh`, so after a reload the order cannot say
   whether the shopper paid by card or by PayPal. The recap cannot name it.
4. **`auto_capture` is inert for Adyen** — no `auto_capture!` call and nothing in the payload —
   so a PayPal sale cannot be auto-captured from a storefront.

Two more, recorded because they will be met eventually and are not on our path today:
`CANCEL_OR_REFUND` always books a `PaymentVoid`, never a `PaymentRefund`; and `require_action`
transitions only `from: :pending`, so PayPal's `RedirectShopper → Pending` sequence raises. That
second one is reachable only through `#payment_details`, which is the advanced flow's relay and
which this integration does not use. Whether the raise is swallowed or surfaces as a 500 depends
on `AASM::InvalidTransition`'s superclass, which we could not verify.

## Decision

### The gate lives inside PayPal's own click

`onClick` rejects when the terms are not accepted; `onInit` renders the buttons disabled until
they are.

```
paymentMethodsConfiguration: {
  paypal: {
    showPayButton: true,   // required: overrides the Core's false, which would delete the component
    onInit:  (_data, actions) => { hold(actions); if (!permitted()) void actions.disable() },
    onClick: (async (_data, actions) => permitted() ? actions.resolve() : actions.reject()) as never,
  }
}
```

Both, not either. `onInit` makes the state visible instead of letting the shopper discover the
refusal by clicking; `onClick` is the enforcement, at the last moment before anything happens.

`showPayButton: true` per method is what re-enables PayPal at all, and it works because
`componentProps` is spread last in `UIElement.buildElementProps` — the Core keeps `false`, so
cards still route through our own button.

Three notes that are part of the decision, not commentary. The cast on `onClick` is unavoidable
and the adyen-web version must be pinned, because Adyen's type says the callback takes no
arguments. `onClick` is a closure created when the Drop-in mounts, so it must read acceptance
through a ref rather than closing over it. And `onInit` hands over its `actions` exactly once,
so they have to be held and `enable()` called later — without that, a shopper who accepts the
terms _after_ the buttons render finds them dead.

### The card path is unchanged, and the two mechanisms are the point

Cards keep `showPayButton: false` on the Core and `<PlaceOrderButton>` calling
`dropin.submit()`. So the library now enforces the same gate in two places, by two mechanisms.

That is not duplication to be tidied away later. Which mechanism applies depends on **who owns
the click**, and that is a property of the payment method, not of our architecture. Moving cards
to the PayPal mechanism for symmetry would reopen a decision that has passed three end-to-end
tests, and buy nothing.

### The privacy-and-terms rule is extracted into one hook

Today the rule is an expression inside `<PlaceOrderButtonPaymentSessions>`:
`privacyUrl && termsUrl ? privacyTermsChecked : true`. Copying that into the gateway component
is the shape of a bug this repository has already shipped: two places asking the same question,
drifting apart. `hasLiveAuthorization` without `hasReturnedMoney` was exactly that, one week
ago.

So the gate becomes a hook both consult. Not the button publishing into the handoff store for
the component to read, and not the reverse: a single owner that neither of them is.

### Our place button disables when the method owns its button

Disabled with a reason the application can render — not hidden.

Hiding removes the one control the shopper has learnt to look for. Leaving it live offers two
routes to one action, and ours leads nowhere: `dropin.submit()` on PayPal produces
`IMPLEMENTATION_ERROR` and no payment. "The selected method has its own button" is a domain
fact the library knows and the application renders, which is the line
`2026-09-01-presentation-belongs-to-the-application.md` already draws.

### The handoff becomes two axes

Four flat fields cannot express what the button now needs to know. Two axes can:

```ts
collection:
  | { by: "host"; submit: () => Promise<PaymentGatewaySubmitResult>; isReady: boolean }
  | { by: "gateway" }
  | null

collectedOutOfBand: "no" | "in-progress" | "done" | "failed"
```

The first answers _who collects_, and `{ by: "gateway" }` **is** the reason the button renders
when it disables itself. The second generalises `resumePhase`: a 3DS redirect return and
PayPal's own button produce the same event — money taken, no click, order still to place — and
having two names for one mechanism is how they end up implemented twice.

### An order placed on `Pending` is correct

`onPaymentCompleted` fires for `Pending` and `Received`, and we place the order anyway.

Not for convenience: `Pending` means Adyen accepted and is waiting for the money, and
`placeOrderWithPaymentSessions` **already** handles that without knowing anything about PayPal —
the authorization stays `pending`, the loop waits, and a payment that never arrives is failed by
the webhook. It is the card mechanism with a longer window.

Which means `onPaymentCompleted` must branch on `data.resultCode` rather than assume captured
funds, and the placeability budget — 20 attempts at 1s, sized for an Adyen webhook — is not
sized for a PayPal eCheck. The honest position is that a genuinely delayed PayPal payment has
no resolution path today, because gap 2 discards the `PENDING` webhook.

### Only `onPaymentFailed` is a verdict

`onPaymentFailed` → `{ status: "failed" }`. `onError` → `{ status: "unknown" }`, whatever its
`name` says.

The empty-message convention that separates a shopper cancel from a script-load failure is
undocumented, and what hangs off it is whether someone's money is given back. Routing every
`onError` to `unknown` means the fragile part cannot decide that: in doubt, nothing is touched.
That is the rule the gift card incident produced, applied one layer up.

### A verdict burns the session; a cancel touches nothing

Same rule as cards for `failed`: delete the Payment Session, create nothing, the shopper
re-picks. Nothing at all for `unknown`.

The asymmetry is deliberate and is the right way round: **cancelling PayPal costs nothing** —
the session is still there and the shopper can click again immediately — while being refused
costs a re-pick. Note that deleting the session remounts the Drop-in and so **destroys the
rendered PayPal button**, which is why the re-pick is visible rather than silent.

### The gift cards are authorized inside `onClick`

Before `actions.resolve()`, and rejecting if any of them fails.

It is the only moment available: with cards we authorize them just before `dropin.submit()`
because we own that call, and here we do not. `onClick` may return a promise
(`PayPalButtonOnClick = (data, actions) => Promise<void> | void`), so the round trip is within
contract.

The state it produces on an abandoned popup — gift cards charged, no payment started — is
exactly the state already accepted for a refused card: still applied, spendable on the retry,
removable through their own control. The two cases are the same one.

### `paymentMethods`, narrowing only

```ts
/** Which of the designed methods to offer. Defaults to all of them. */
paymentMethods?: Array<"card" | "paypal">
```

Our vocabulary, not Adyen's tx-variants. So an application can turn PayPal off without waiting
for a release, and cannot turn on a method nobody has designed for — where the failure is worse
than a dead control: an undesigned wallet renders an empty accordion, and re-enabling its button
walks past the gate. The `card → scheme` mapping stays inside the library, and adding a method
widens a union, which is additive and type-checked. A value outside it is dropped with a
development warning, as `<PaymentSetting>` already does for unimplemented setting types.

### An end-to-end test is mandatory here

The gate rests on a signature Adyen does not document. A unit test with a mocked SDK proves
that we pass `onClick` into `paymentMethodsConfiguration.paypal`; it cannot prove that PayPal
calls it with `actions`. Only an end-to-end run distinguishes those, and that distinction is the
risk.

So: one end-to-end test through the popup, plus the unit test that the callback is forwarded.
The `payment_source`-model fixture is reusable whole — `waitForEvent("popup")`, the sandbox
login, `.adyen-checkout__paypal__button >> nth=0`. A closed popup is worth attempting with
`newPage.close()`, since it is a rollback branch nothing has ever tested; if it does not
reliably produce `onError('CANCEL')` it is dropped with a note rather than chased into PayPal's
SDK. A blocked popup and the dispute branches stay out.

## Considered options

- **`beforeSubmit` as the gate.** Rejected: runs after the popup is open, and rejecting it
  leaves `createOrder`'s promise unsettled, hanging the popup forever.
- **`beforeRedirect` or `onActionHandled` as the gate.** Rejected: the first is structurally
  unreachable for PayPal, the second fires too late and returns `void`.
- **`dropin.submit()` for PayPal.** Not an option — it throws by design.
- **Keeping `allowPaymentMethods` as a passthrough prop.** Rejected: hands every consumer the
  ability to produce an empty accordion or a bypassed gate.
- **Hardcoding the list with no override.** Rejected: a merchant who does not want PayPal
  should not have to wait for a release.
- **Keeping `resumePhase` and adding a second signal for PayPal.** Rejected: one mechanism, two
  names, implemented twice.
- **Copying the terms expression into the gateway component.** Rejected for the reason the
  `holdsMoney` bug gave us.
- **Moving the card path to the PayPal mechanism**, for one gate mechanism instead of two.
  Rejected: reopens a tested decision to buy symmetry.
- **Matching `'PayPal overlay closed'`.** That constant exists in `constants.ts` and is never
  thrown anywhere in the bundle.

## Consequences

**Two pay buttons are on screen, and that is the design.** Ours, disabled with a reason
whenever the selected method owns its own; PayPal's, inside the expanded row.

**`onPaymentCompleted` no longer means money taken.** Every consumer reading it has to branch on
`resultCode`. This is a behaviour change for the card path too, where the same callback
previously only ever meant `Authorised`.

**A delayed PayPal payment has no resolution path.** `PENDING` is discarded upstream, so the
authorization stays `pending`, the placeability loop exhausts, and the shopper is told we are
still checking — which is true and unhelpful. This is the first real case of the open question
the place-order ADR left: what a timeout should actually show.

**The recap cannot name PayPal.** `payment_instrument` is empty for Adyen, and
`client_data.payment_method` — the obvious place to record it — is the tripwire above. So the
order, after a reload, knows a payment happened through the Adyen setting and not which method.

**The gate is enforced in two places.** Accepted, and the hook is what keeps them from drifting.
A third mechanism would be the point to stop and redesign.

**The integration depends on an undocumented signature.** Pin `@adyen/adyen-web`, keep the
forwarding test, and treat an adyen-web upgrade as something that needs the PayPal end-to-end
test run before it lands.

**PayPal's language will not follow the checkout** unless `locale` is set per method, because it
is not a `GENERIC_OPTIONS` key. Left unset deliberately for now: PayPal auto-detects, which is
usually right, and the alternative is mapping the checkout's locale onto a 24-entry allow-list
whose misses are silent.

### Assumptions this design rests on

1. **PayPal's SDK opens its popup on the user gesture, before `onClick` settles.** The contract
   allows an async `onClick`, so the SDK must wait for it — but whether the window is opened
   eagerly or after resolution is PayPal's runtime behaviour, loaded from their CDN and not
   inspectable here. If it is opened after, a slow gift card authorization could get the popup
   blocked. **The end-to-end test settles this, and it is the first thing it proves.**
2. **Adyen keeps forwarding `onClick` and `onInit` verbatim into `paypal.Buttons`.** Undocumented
   in Adyen's own types, which declare `onClick` as taking no arguments.
3. **The empty-message convention separates a shopper cancel from a script-load cancel.** We do
   not rely on it for anything that moves money — that is the point of routing every `onError` to
   `unknown` — but it is the only signal available if the two ever need telling apart.
4. **`AASM::InvalidTransition` descends from `StandardError`.** Unverified: there is no Ruby
   toolchain here. It decides whether an upstream defect fails silently or as a 500, and that
   defect is not on this integration's path.

### Correction: the wallets are not "host-drivable, so easier" (2026-09-07)

An earlier draft of this table called Apple Pay and Google Pay an easier problem than PayPal
because, unlike PayPal, both override `submit`: Apple Pay's calls `startSession()` and Google
Pay's calls `loadPaymentData()`. That is true and it is not the point.

Both of those must run **inside a user gesture** — Safari throws
`Must create a new ApplePaySession from a user gesture handler`, and Google requires the same of
`loadPaymentData()`. Our place-order sequence authorizes the gift cards _before_ it asks the
gateway to collect, so by the time `submit()` runs the gesture is spent. The ordering is not
negotiable either: a refused payment must never leave gift cards charged after it.

So both wallets want their own button and the PayPal mechanism — gate and gift cards inside the
method's own click — and `submit` being available changes nothing. Apple Pay adds two obstacles
of its own: `isAvailable()` rejects outright unless `location.protocol === "https:"`, so it
never renders on the dev server, and it needs Safari with a card in Wallet, which Playwright's
WebKit is not and does not have. **Apple Pay cannot be covered by an e2e at all** — not the
payment, not even the button.

Google Pay has neither problem: no protocol guard in the bundle, availability decided by
`isReadyToPay()`, and it runs in the Chromium these tests already use. It is therefore the
second instance of the Gateway-Owned Button pattern to build, and the one that will show whether
the abstraction generalises. Note its `onClick` is `(resolve, reject) => void` positionally, not
PayPal's `(data, actions)`.

### Asks for the API

In dependency order. The first is the one the others sit on.

1. **`Session::Base` should carry what `Payments::Base` already carries** — `lineItems` and
   `shopperEmail`, built from the order server-side.

   Re-verified at core-api `65c08cc73` (2026-09-05). Klarna requires `lineItems` — mandatory,
   totalling `amount.value`, each with a `description` — plus `shopperEmail`.
   `Payment::Payload::Adyen::Session::Base#to_h` sends neither. The only extension point is
   `payment_session.options`, which `Payload::Session` delegates straight to the session
   attribute, and `ProhibitedAttributesCheck` raises `CanCan::AccessDenied` on it for a
   sales-channel token (`prohibited: [read, write]`, enforced `if: :sales_channel?`). So a
   storefront cannot supply them by any route.

   The earlier framing of this ask — open `options` to sales channels — was the expensive one: a
   permissions change, with a storefront then responsible for a payload it should not be
   composing. The cheap one is three lines in the same repository, because
   `Payments::Base#line_items_data` already exists one class over and builds exactly this from
   the order. No new permission, no storefront API change, and nothing to build in this library
   until it lands.

2. **Handle `PENDING` and `OFFER_CLOSED`.** Both are discarded by `CODES`, in a `retry: 0`
   worker, after a 200 has gone back to Adyen. The first leaves a delayed payment unresolvable;
   the second leaves an abandoned one with no signal.
3. **Populate `payment_instrument` for Adyen sessions.** `Payment::Instrument::Adyen::Account`
   already knows how to describe a `paypal` account; nothing invokes it, because
   `Payment::Session::Adyen` overrides neither `payment_data` nor `refresh`.
4. **Make `auto_capture` real for Adyen, or stop advertising it** — it is writable, readable,
   documented, and does nothing.

Two more worth filing, not on this path: `CANCEL_OR_REFUND` books a `PaymentVoid` where a
refund happened, and `require_action` transitions only `from: :pending`, which PayPal's
`RedirectShopper → Pending` sequence violates.

### Payment method status, inside `payment_setting_adyens`

| Method     | adyen-web type | Status                                                                              |
| ---------- | -------------- | ----------------------------------------------------------------------------------- |
| Card       | `scheme`       | ✅ implemented — `2026-09-02-adyen-payment-setting.md`                              |
| PayPal     | `paypal`       | 🟡 built; the handoff verified end to end, the payment refused by Adyen — see below |
| Apple Pay  | `applepay`     | ⬜ deferred — needs HTTPS and Safari, so **unverifiable** in this stack             |
| Google Pay | `googlepay`    | ✅ implemented — `2026-09-07-google-pay-through-adyen.md`                           |
| Klarna     | `klarna*`      | ⬜ blocked upstream — see ask 1, reshaped                                           |

## What the first end-to-end run established (2026-09-07)

Built, unit-tested, and run against the real Adyen sandbox on the `payment_sessions`
organization. Three things separated cleanly, and it is worth recording which is which.

**The handoff works.** Selecting PayPal in the Drop-in publishes `{ by: "gateway" }`, our place
button disables itself, the application renders its reason, and switching back to the card row
hands collection back. That is `payment-sessions-paypal.spec.ts`, the one test here that needs
no popup and takes no money, and it is green.

**Adyen offers PayPal on this account.** The `/sessions/{id}/setup` response lists
`scheme, applepay, paypal, googlepay` for a US/USD order. So neither the account configuration
nor the session payload is what was hiding it — `countryCode` is sent by
`Payment::Payload::Adyen::Session::Base` and was correct.

**The payment is refused after PayPal approves it.** The popup completes, PayPal returns its
token, and `/sessions/{id}/paymentDetails` answers `resultCode: "Refused"` — with no
`refusalReason`, which Adyen never sends to a client-side integration. The reason is only in
Adyen's Customer Area, and the most likely one is that the sandbox buyer these tests sign in as
is not valid for this merchant's PayPal integration. So the two paying tests are written and
currently fail there.

The library's own behaviour on that refusal is what it should be, and this run is the evidence:
the burnt Payment Session was discarded, the order came back `pending` / `unpaid` with **zero**
payment sessions, the setting was deselected, and the shopper was told. Nothing was left behind
for a second attempt to trip over.

### The closed gate is reported from PayPal's click

`onClick` refuses when the terms are not accepted, and it now says so — an error carrying
`meta: { error: "TermsNotAccepted" }` on the component's own `errors`, which every consumer
already renders.

The earlier position was that reporting was unnecessary because `onInit` has the buttons
disabled anyway. A manual run refuted it: a disabled PayPal button absorbs the click and says
nothing, and "nothing happened" is indistinguishable from a broken button. Nobody but the
library can produce that reason, because the click is PayPal's and never reaches the
application — so this is not a case where presentation could belong to the consumer alone.

**No new callback.** The component's `errors` render prop is the existing channel, and the
message arrived in mfe-checkout with no change to the application at all. What the application
_does_ own is the copy: it keys off `meta.error` and translates, falling through to the
library's English default for a code it does not recognise.

And it settles something the types do not answer: **`onClick` fires on a button
`actions.disable()` has disabled.** Verified end to end — the test that clicks PayPal before
accepting the terms is green, which is the only reason this design works at all. Were it
otherwise, the button would have to stay live and reject instead.

### Adyen renders four PayPal buttons, not one

`PaypalButtons.js` calls `paypal.Buttons()` **once per funding source** — PayPal, Credit, Pay
Later, Venmo — each with its own `onInit`. So `actions.enable()` reaches exactly the instance
its actions came from, and holding a single `PayPalOnInitActions` keeps only the last one
rendered, which is Venmo.

That shipped, and a manual run found it immediately: a shopper who accepted the terms _after_
the buttons had rendered got a working Venmo button while PayPal and Pay Later silently
swallowed the click. Fixed by holding a `Set` and driving every member.

No e2e saw it, and the reason is worth keeping: every test accepted the terms _before_ selecting
PayPal, so nothing was ever disabled and `enable()` was never needed. The tests now accept them
in the shopper's order instead, and the unit spec drives four funding sources rather than one.

Anything per-funding-source is therefore plural by default. Apple Pay and Google Pay render one
button each, but the same question — _does this callback fire once or once per button?_ — is the
first one to ask of them.

**A trap worth knowing.** The first run of this suite failed with the Drop-in offering cards
only, and three plausible explanations were chased — the Adyen account, the session payload, a
CSP blocking PayPal's SDK — before the real one: mfe-checkout's e2e stack consumes
`packages/react-components/dist`, and the bundle predated the PayPal work. The unit suite reads
`src`, so it was entirely green against code the browser had never seen. Build the library
before running any e2e.
