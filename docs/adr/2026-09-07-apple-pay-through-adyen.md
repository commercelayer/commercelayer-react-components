# Apple Pay through Adyen: the same wallet, asked for rather than offered

**Date:** 2026-09-07
**Status:** accepted, verified by hand on Safari (2026-09-08)
**Scope:** Apple Pay offered inside the Adyen Drop-in, on the `payment_sessions` model

## Context

`2026-09-07-google-pay-through-adyen.md` said Apple Pay was deferred because it is unverifiable
in this stack: `isAvailable()` rejects unless the document is `https:`, and it needs Safari with
a card in Wallet, which Playwright's WebKit is not and does not have. That has not changed.

What changed is the domain. `checkout.gciotola.commercelayer.dev`, served through ngrok, is
already registered for Apple Pay on the Adyen merchant account, so a human can run it on Safari
even though a test cannot. Deliberately **no e2e** — there is nothing Playwright could assert.

`examples-new-payments` was read for what applies. Its Drop-in
(`src/components/adyen-payment-form.tsx`) turns out to say nothing about this problem: it never
sets `showPayButton: false`, so every method self-submits and there is no place button and no
terms gate to reconcile. Its useful findings are in `docs/express-payment-gaps.md`, and belong
to the **advanced** flow, where there is no session to source configuration from — hence
`CL_APPLE_PAY_MERCHANT_ID` / `_MERCHANT_NAME` env vars, without which the component throws on
`configuration.merchantName` or Adyen answers `702 Required field 'merchantIdentifier' is null`.
None of that applies here, and the session response proves it: `applepay.configuration` arrives
as `{ merchantId, merchantName }` already.

## Decision

### Apple Pay is Google Pay, and the code says so

`ApplePay.js` and `GooglePay.js` are the same shape in every respect that matters:

|                           | Apple Pay                                                                                | Google Pay                                         |
| ------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Own button                | `componentToRender` gated on `showPayButton`, `onClick: this.submit`                     | identical                                          |
| Click                     | `new Promise((resolve, reject) => onClick(resolve, reject)).then(() => session.begin())` | `…then(showGooglePayPaymentSheet)`                 |
| Before the money          | `handleAuthorization().then(makePaymentsCall)`                                           | identical                                          |
| A rejected `onAuthorized` | `STATUS_FAILURE` + `handleFailedResult`                                                  | `transactionState: "ERROR"` + `handleFailedResult` |

So one `walletConfiguration()` builds both, and Apple Pay was added by calling it a second time.
The gate stays on the click and synchronous, because `session.begin()` waits on it inside the
gesture; the gift cards stay on `onAuthorized`; and the self-abort flag that stops a rejected
`onAuthorized` being read as a refusal was already there and needed nothing.

`countryCode` and `amount` are not passed either: `Core#initializeCore` merges them from the
session setup response, which is where Apple Pay's request reads them from.

### A rejection is an `ApplePayError`, not a string

The one thing the wallets do not share. Adyen types Google Pay's `reject` as
`(error?: PaymentDataError | string)` and Apple Pay's as `(error?: ApplePayJS.ApplePayError)`, and
`completePayment` shows Apple's own generic wording for anything else. So `walletConfiguration`
is generic over the error type and each method supplies its own constructor —
`new ApplePayError("unknown", undefined, message)`, `"unknown"` being the only code that is not
about a contact field.

The constructor is looked up on `globalThis` when needed rather than at module load: Safari-only,
absent from the DOM lib, and a module-scope read would fix the answer before hydration. Where the
global is missing we reject with `undefined` rather than the string — unreachable in practice,
since no `ApplePayError` means no Apple Pay button was ever rendered, and handing Apple a string
it discards would be worse than handing it nothing.

Whether Safari renders our message or its own wording for `"unknown"` is not something the DOM
contract promises. This is written to be correct, not to guarantee the copy, and it is one of the
things the live run should look at.

### Apple Pay is opt-in — the one method that is

Cards, PayPal and Google Pay are in the defaults, because for those being offered is evidence
they can work: each either works or filters itself out, through `isReadyToPay()`, funding
eligibility, or `isAvailable()`.

Apple Pay does not have that property. Its availability check asks only whether the browser and
device can pay at all. Whether _this domain_ is registered for Apple Pay on the merchant account
is settled later, at merchant validation, **after the shopper has tapped** — so on an
unregistered domain the button renders and then fails. The registration is out-of-band (Adyen's
Management API `addApplePayDomains`, plus `.well-known/apple-developer-merchantid-domain-association`
served publicly at that exact origin) and nothing in a browser can detect it.

So `"apple_pay"` must be asked for. This is a narrow exception to "offer everything that has been
built", and it is the safe direction: a consumer who has done the registration adds one array
entry, while one who has not is never handed a control that cannot work. `mfe-checkout` opts in,
with a comment saying that doing so is a claim about its domains.

Note this is separate from the Client Key's **Allowed origins**, which the same origin must also
be in or the `checkoutshopper…/applePay/sessions` preflight is CORS-blocked. Two settings, two
failure modes, and only the second looks like a network error.

## Consequences

**Nothing is covered by a test that runs.** Fifteen unit specs cover the configuration, the gate,
the gift-card moment, the `ApplePayError` dressing and the self-abort — all against a fake
Drop-in. Everything past the tap is a human on a device.

**And that device is an iPhone, not the Mac.** Adyen's TEST environment cannot process a real
card, so the card stage needs one of Apple's published sandbox test cards, and those can only be
added to Wallet by a **sandbox tester** Apple Account — created in App Store Connect, which means
the Apple Developer Program is genuinely required for this part, if not for the domain. Apple's
instructions are to _"sign out of iCloud and sign into your test device with your sandbox tester
account"_, and its list of supported sandbox devices is iPhone, iPad and Apple Watch — the Mac is
not on it.

So the least invasive route is to put the sandbox tester on a phone, add a test card there by
manual entry, and open the tunnelled checkout URL in **Safari on that phone**. The Mac's iCloud
stays untouched, and the code path is identical: same Drop-in, same gate on the click, same gift
cards on `onAuthorized`. The device's region has to be one where Apple Pay is available.

**The live run should confirm, in this order:** the row appears in Safari on the registered
domain; tapping opens the sheet (the gesture survived the gate); on-device auth completes and the
order places; and a gift card that cannot be charged shows something legible in the sheet rather
than Apple's generic failure.

**Three methods now share one code path and one bug surface.** That is the point, and it also
means a regression in `walletConfiguration` breaks Apple Pay silently, since only two of the
three are tested end to end.

**Klarna remains the open one**, blocked on `Session::Base` carrying `lineItems` and
`shopperEmail` — see ask 1 in the PayPal ADR.

## What the first Safari run established (2026-09-07)

**The sheet opens.** Which was the one thing about this design that could have been wrong: the
gate on the click is synchronous, `session.begin()` waits on it, and Safari accepted the gesture.
The wallet pattern therefore holds for both wallets, and the Google Pay e2e that asserts the same
property is guarding something real.

**Then it closes immediately with `ApplePay - Something went wrong on ApplePayService`.** That
string has exactly one origin in `adyen-web`, and it is worth writing down because the message
names the wrong thing entirely. From `ApplePayService.js`:

```js
onvalidatemerchant(event, onValidateMerchant) {
  return new Promise((resolve, reject) => onValidateMerchant(resolve, reject, event.validationURL))
    .then(data => this.session.completeMerchantValidation(data))
    .catch(e => { console.error(e); this.session.abort(); this.options.onError(e) })
}
```

`options.onError` is reached from nowhere else — every other handler catches into its own
`complete*` call. So the message means **merchant validation failed**, and nothing else can
produce it.

Which rules out the shopper's card and their Apple account: `onvalidatemerchant` fires when the
sheet opens, before any card has been chosen. An Apple _sandbox tester_ account would change
nothing here, and Adyen's test environment accepts a real card in Wallet anyway. The first
instinct — "I am signed in with my personal Apple ID" — is a reasonable read of the symptom and
not the cause.

What actually runs is `ApplePay#validateMerchant`, a POST to
`checkoutshopper-test.adyen.com/checkoutshopper/v1/applePay/sessions?clientKey=…` carrying
`{ displayName: configuration.merchantName, domainName: window.location.hostname, initiative: "web",
merchantIdentifier: configuration.merchantId }` — all four from the session, none of them ours.
So the two things it can be about are the **origin** and the **merchant account**, which is why
they are two separate prerequisites in the decision above.

**The diagnosis path, for next time.** `console.error(e)` runs immediately before the message, so
the real cause is the line _above_ it in Safari's console, and the Network tab has the
`v1/applePay/sessions` request with its status and body. A request that never gets a response is
the Client Key's Allowed origins; a response saying no is the Apple Pay domain registration on
that merchant account.

`domainName` is overridable by a prop on Adyen's component. We do not expose it, and should not
until something needs the served hostname and the registered one to differ.

### What the validation actually answered

```json
{
  "status": 422,
  "errorCode": "000",
  "errorType": "validation",
  "message": "Payment Services Exception pspId=2EA0… unauthorized to process transactions on behalf of merchantId=000000000326725 reason=000000000326725 is not a registered merchant in WWDR and isn't properly authorized via Mass Enablement, either."
}
```

A response arrived, which settles the first prerequisite: the origin **is** in the Client Key's
Allowed origins, or the preflight would have been CORS-blocked and there would be nothing to read.

The message names both routes into Apple and says neither is open for this merchant account.
`WWDR` is Apple's Worldwide Developer Relations CA, behind Apple Pay certificates — that is the
_own certificate_ route. _Mass Enablement_ is Apple's programme letting a PSP enable Apple Pay for
its sub-merchants at scale — the _Adyen's certificate_ route. So Apple Pay exists on the Adyen
merchant account, which is why `/setup` advertises it with a configuration, and the Apple side of
it was never completed.

The shape of the identifier says which route the account is on: a merchant identifier you create
yourself is reverse-DNS (`merchant.io.commercelayer.…`), and `000000000326725` is numeric, i.e.
Adyen's own. So the account is on Adyen's certificate and the missing piece is the enablement of
that merchant account with Apple — which the error says the PSP does not have, and which no
dashboard setting can grant.

**Nothing here is ours to fix.** `merchantIdentifier` reaches the browser from
`applepay.configuration` in the session, which comes from the Adyen account configuration through
Commerce Layer. This library never composes it, and there is no code change that could.

**It does vindicate the opt-in default.** An account in this state advertises Apple Pay in the
session and passes `isAvailable()` — the device can pay — so a consumer who got the method by
default would have shipped a button that opens a sheet and closes it again. Being offered really
is not evidence it can work.

**And it was the domain — the message names the wrong thing entirely.**
`examples-new-payments` had recorded this same `merchantIdentifier`
(`000000000326725` on `CommerceLayerInc245_NEW_PAYMENTS_TEST`) on 2026-07-13, against the domain
`examples-new-payments.netlify.app`. The ngrok domain we now serve was never registered on that
account.

Settled by running Adyen's validation endpoint twice with only `domainName` changed:

| `domainName`                          | Answer                                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout.gciotola.commercelayer.dev` | `422` — "…pspId=… unauthorized to process transactions on behalf of merchantId=000000000326725 … is not a registered merchant in WWDR and isn't properly authorized via Mass Enablement, either." |
| `examples-new-payments.netlify.app`   | `200` — a live Apple merchant session, valid for one hour                                                                                                                                         |

So the pspId **is** authorized for that merchantId, the Mass Enablement **is** in place, and the
only difference between a 422 and a working merchant session is whether the domain is registered.
**An unregistered Apple Pay domain is reported as a message about the merchant, and never mentions
the domain at all.** That is the trap worth writing down: read literally, it sends you to Adyen
support to ask for an enablement that already exists.

The fix is one Management API call — `POST /v3/merchants/{merchantId}/paymentMethodSettings/{paymentMethodId}/addApplePayDomains`
with `{ "domains": [...] }`, since the Customer Area tile is read-only after creation. Nothing in
this library, and no Apple Developer account: registering a domain under Adyen's certificate does
not need one.

**The diagnostic ordering to keep.** `console.error(e)` before the message, then the response body
of `v1/applePay/sessions`, then — before reading that body literally — the same call with a domain
known to be registered. The third step is what turns an ambiguous message into an answer, and it
costs a minute.

**One observation left open.** What the shopper saw was
`ApplePay - Something went wrong on ApplePayService`, because `onError` reports the SDK's own
message. That is fine for a developer and meaningless to a shopper, and it is not specific to
Apple Pay — the card path does the same with any `onError`. Worth deciding separately whether
gateway internals belong in a shopper-facing error at all.

## Why the own-certificate route needs a server, and cannot be stubbed

Checked at the source, because it decides where this library stops.

Merchant validation is not an Adyen step with an Adyen policy attached. When Safari displays the
sheet it fires `onvalidatemerchant` with a `validationURL`, and per Apple's own merchant
integration guidance **"the merchant server builds a session request payload and posts it to the
Apple Pay servers using two-way TLS. The certificate used for this connection is the merchant
identity certificate."** The identity certificate and its private key are packaged as a `.p12` to
make that call.

Two consequences follow, and neither is negotiable:

**A browser cannot make that call.** `fetch()` cannot present a client certificate, and the
private key could not safely live in a page if it could. So the own-certificate route requires an
endpoint — a small one, a single route that performs the mTLS POST and returns the response, but
an endpoint. This library is storefront-only by construction, so that endpoint is the
application's, never ours.

**It cannot be faked in test.** What must reach `completeMerchantValidation` is Apple's own
merchant session object, and Apple is explicit that it **"should not be modified in any way,
otherwise merchant validation will fail."** A local handler returning a plausible-looking `OK` has
nothing to return: the value is opaque signed data only Apple can mint. There is no stub, in test
or anywhere else — which is a useful thing to know before building one.

**And the two routes are mutually exclusive per merchant account.** Adyen can only perform the
mTLS with a certificate it holds. On the own-certificate route you upload the _payment processing_
certificate to Adyen and keep the _identity_ certificate — so Adyen has nothing to present, which
is exactly why its own instructions have you put the PEM on your server. A merchant account is
therefore on one route or the other, and the integration has to match it.

### The hybrid, if it is ever wanted

`adyen-web` already has the seam: `onValidateMerchant: props.onValidateMerchant || this.validateMerchant`,
typed `(resolve: (merchantSession: unknown) => void, reject: (error?: string) => void, validationURL: string) => Promise<void>`.
So the shape a hybrid would take is one passthrough prop:

- **absent** — Adyen's certificate, Adyen's `/applePay/sessions`, no server anywhere. What is
  implemented today, and the right default: a merchant with no backend gets Apple Pay.
- **provided** — the application's own endpoint, holding its own identity certificate.

We would hold no certificate and make no request; we would forward a callback. That is inside a
storefront library's remit, and it is the only version of "configurable validation" that is.

Not built, because it is inert until an endpoint exists on the other side, and because the shorter
path to a working test — Adyen completing the Mass Enablement on the merchant account — needs no
Apple Developer work and no code at all. The trigger for building it is an application that has
its own certificate and endpoint and wants this component in front of them.

## It works (2026-09-08)

Apple Pay through the Drop-in completes on the `payment_sessions` model. Verified by hand,
because no test can do it: Safari, a registered domain, a sandbox tester with one of Apple's
published test cards.

Three things had to be true, and each was a separate blocker discovered in turn:

1. **The domain registered on the right merchant account.** Adyen granted the
   "Payment methods read and write" role, and `checkout.gciotola.commercelayer.dev` was added to
   the Apple Pay domains of `PM32CTG22322865PKXRTP6GR5` on
   `CommerceLayerInc245_NEW_PAYMENTS_TEST`. The 422 that had looked like a missing enablement was
   only ever this.
2. **A sandbox tester holding an Apple test card.** Adyen's TEST environment cannot process a
   real card, which is what the July failure had been all along — the ticket answer about test
   cards was right, two blockers early.
3. **A second macOS user**, signed into iCloud as that tester, so the primary account's iCloud
   was left alone. Apple's own sandbox device list does not mention the Mac; a second user
   account works, and the machine-level "security settings were modified" failure did not occur
   here.

**Nothing in the library changed to make it work.** The wallet code that shipped for Google Pay
carried Apple Pay unmodified: the same `walletConfiguration`, the gate on the click, the gift
cards on `onAuthorized`, the self-abort guard. Every blocker was configuration, in three
different systems, each reported by a message that named something else.

**Still unverified, and only a human can:** whether Safari renders _our_ message from
`new ApplePayError("unknown", …)` when a gift card cannot be charged, or its own wording for that
code. The path is exercised and correct; what the shopper reads is not known.
