# Adyen as a Payment Setting: the client-side Drop-in only

**Date:** 2026-09-02
**Status:** accepted
**Scope:** `payment_setting_adyens` on the `payment_sessions` model

## Context

Adyen is the first Payment Setting that takes a card. Manual and gift card both ship
without a gateway UI: selecting them *is* the whole interaction, and the money moves at
place time. A card needs a form, an SDK, a 3DS round trip and a gateway that can refuse —
none of which the two shipped settings exercise.

The binding constraint is that **everything must work in the browser under a
sales-channel or customer token**. This package has no server side, so any design that
needs an integration credential is not a design we can have. That single constraint
decides most of what follows, and it is the reason this ADR diverges from the
`examples-new-payments` playground on the one decision where the playground had a server
available and we do not.

### In scope

The **client-side Drop-in**, also called the *sessions flow*: Commerce Layer creates an
Adyen session, the browser hands its id and blob to `AdyenCheckout`, and adyen-web talks
to Adyen directly. Cards only. Including the return from a 3DS redirect, which is not
optional — see below.

### Out of scope, and why

- **The advanced flow.** Adyen is called by Commerce Layer, and the 3DS result is relayed
  back through `payment_authorizations._payment_details`. It needs an integration token,
  because `payment_authorization.response_data` — which carries the action the shopper must
  perform — is withheld from sales-channel and customer tokens
  (`config/attributes/payment_transaction.yml:104-113`). A component library cannot hold
  that credential.
- **Express / wallet payments** (Apple Pay, Google Pay, PayPal as an express button). A
  different entry point into the checkout — before an address exists — with its own
  interaction to design. Also blocked on reading `public_key` before an order exists; see
  *Assumptions and known gaps*.
- **Saved cards through Commerce Layer's `payment_wallets`.** The playground's ADR 0003
  makes `payment_wallets` the source of truth and uses the Drop-in only to enter a fresh
  card. That decision was taken while designing the *advanced* flow, where reuse runs
  through `_internal_version: "WalletCvv"` and a server-side relay. In the sessions flow
  reuse is entirely Adyen's: the Drop-in posts `storedPaymentMethodId` plus an encrypted
  CVC to `/sessions/{id}/payments` and Commerce Layer never sees it. We therefore use
  **Adyen's wallet as the source of truth** and ignore the `payment_wallets` Commerce Layer
  creates. See *Saving a card*.

### What the API actually does

Verified in `core-api` at `40967361d`. None of this is documented, and parts of the SDK
types are wrong (see the existing note in `2026-08-18-payment-session-lifecycle.md`).

**The Adyen session lives in `payment_session.response_data`.** Creating the session makes
Commerce Layer call Adyen `/sessions`; the response lands in `response_data`, from which the
browser reads Adyen's own field names, `id` and `sessionData`. That attribute is deliberately
readable by sales-channel tokens — `config/attributes/payment_session.yml:115-123` carries no
`prohibited` key and is documented *"used by client"* — while `payment_session.options` is
`prohibited: [read, write]` on the same resource.

**Only `return_url` reaches Adyen from `client_data`.**
`app/models/payment/payload/adyen/session/base.rb:10-23` reads `client_data` exactly once:

```ruby
payload[:returnUrl] = client_data[:return_url]
```

Every other key is dropped at session creation. They come back into play in the `/payments`
payload, which the sessions flow never uses.

**A session's Adyen payload is fixed at creation, and cannot be refreshed.**
`Payment::Session::Adyen` does not override `refresh`, so it inherits
`Payment::Session::Base#refresh; true; end` (`app/models/payment/session/base.rb:33`) —
`PATCH { _refresh: true }` on an Adyen session is a **no-op**. Anything Adyen must know has
to be sent on the `POST`.

**`expires_at` is Commerce Layer's number, pushed to Adyen.**
`Payment::Session::Adyen::EXPIRATION = 1.day`; `PaymentSession#set_expiration`
(`app/models/payment_session.rb:195-198`) sets `expires_at ||= Time.current + ew`, and
`session/base.rb:21` sends it as `expiresAt`. A client-supplied value wins. Adyen's echoed
`expiresAt` sits unread in `response_data`.

**Commerce Layer's own `/payments` call fails, by construction, and that is load-bearing.**
In the sessions flow the card data never reaches Commerce Layer, so
`Payment::Payload::Adyen::Payments::Base#payment_data` returns `nil`, `.compact` drops the
key (`app/models/payment/payload/adyen/payments/base.rb:23,37,60-69`), and Adyen answers
`14_006` — *required object 'paymentMethod' is not provided*. The Adyen Ruby client raises
only on `401`/`403`, so nothing is rescued; `Payment::Session::Adyen#authorize!`
(`app/models/payment/session/adyen.rb:68-77`) has **no** status check, unlike its own
`#create` which does `if result.status >= 300`; and the error body carries no `resultCode`,
so `action_by_status` (`app/models/payment/session/base.rb:54-70`) matches no branch and —
having **no `else`** — fires no AASM event.

**The authorization therefore stays `pending`**, with the 422 in `response_data` and every
timestamp null. It is settled later by Adyen's `AUTHORISATION` webhook, which finds the
session by `merchantReference == payment_session.token`
(`app/models/payment/event_handler/adyen.rb:132-135`) and calls `succeed!`
(`:177-188`). `pending` is a legal source for `succeed`, so it lands.

**`requires_action` never occurs in this flow.** `action_by_status` is reachable only from
`#authorize!` and `#payment_details`; the first sees `resultCode: nil` and the second is
never invoked, because adyen-web relays the authentication result to Adyen itself. The
authorization goes `pending → succeeded`.

**A refusal is reported to Commerce Layer, and it burns the authorization.** The same
`AUTHORISATION` webhook with `success: "false"` creates a `failed` `PaymentAuthorization`
on the session (`event_handler/adyen.rb:49-59`, spec-verified at
`spec/models/payment/event_handler/adyen_spec.rb:106-115`). The **session** stays `unpaid`,
because no AASM hook fires on failure — but a later success on the same session takes the
"authorization already exists" branch and calls `succeed!` on a `failed` record, which is
not a legal transition (`app/models/payment_transaction.rb:42-46`), is not silenced
(`whiny_transitions` is at its default) and is not retried (`retry: 0`). The retry's
success would never land.

**A sales-channel token may refund a gift card, and only that.**
`app/abilities/base_abilities/sales_channel_ability.rb:26`:

```ruby
can :create, PaymentRefund, payment_session: { payment_type: 'GIFT_CARD', order: { status: Order::STATE_PENDING.to_s } }
```

Gift card only, order in `pending` **exactly** — `draft` is excluded. `payment_capture` is a
required relationship, and one always exists because the gift card client hard-codes
`auto_capture?` to `true`. Nothing validates order status beyond that ability, so refunding
during a failed checkout works. It does move the order to `payment_status: refunded` while
`status` is still `pending`.

**`public_key` is readable, through one request.**
`config/attributes/payment_setting_adyen.yml:26-35` carries neither `prohibited` nor
`confidential`, so it survives the sales-channel filter in
`app/resources/concerns/resource_fields.rb:18-23`; and
`?include=available_payment_settings` serializes per-provider, not as the polymorphic base
(`spec/api/orders_spec.rb:1701-1718`). Listing payment settings is blocked for sales
channels (`app/controllers/api/base_controller.rb:139-142`), so the order include is the
only discoverable path. It is also **more** than the older model gave: on
`payment_gateways`, `public_key` is `fetchable: false` and there is no
`can :read, PaymentGateway` anywhere — the key reached the browser only by delegation onto
a payment source that had to be created first.

**`public_key` is optional and unvalidated.** `app/models/payment_setting_adyen.rb:10`
validates `api_key`, `merchant_account` and `webhook_endpoint_secret`, not this. A working
server-side Adyen setting can have a null `public_key`.

**`available_payment_settings` does not filter disabled settings.**
`app/models/concerns/order_payments.rb:169-175` returns `market.payment_settings` with no
`.enabled`, unlike `PaymentMethod.for_jwt(jwt).enabled` on the older model.

**`auto_place` fires from the session's transition, so the webhook path is covered.**
`app/models/payment_session.rb:30-36` runs `order.place! if auto_place?` in the `authorize`
`after_commit` — whichever route settled the authorization. **`auto_capture` is inert for
Adyen**: it is only ever called from `Payment::Session::Base#authorize!`
(`base.rb:72-92`), and `Payment::Session::Adyen` overrides that method without calling it.
Adyen captures come from the `CAPTURE` webhook, driven by the capture delay in Adyen's
Customer Area.

**`_internal_version: "Tokenization"` is creatable by a sales-channel token.**
`config/attributes/payment_session.yml:172-181` is `creatable: true` with no `prohibited`
key, and there is an explicit spec for it. It makes
`Payment::Payload::Adyen::Session::Tokenization` inject `shopperReference` (from
`customer.shopper_reference`), `storePaymentMethodMode: 'askForConsent'` and
`recurringProcessingModel: 'CardOnFile'` — but only `next unless c = order.customer`, so a
customer-less order gets none of the three. It is the **only** client-reachable way to get
a `shopperReference` into the Adyen session.

### What adyen-web v6 actually does

Verified against `6.42.0`, the version this package installs.

**The sessions flow owns 3DS completely.** `redirect`, `threeDS2Challenge` and
`threeDS2DeviceFingerprint` are pre-seeded in the component registry
(`core/core.registry.ts:21-26`), and `makePaymentsCall` /
`makeAdditionalDetailsCall` fall through to the session when no `onSubmit` /
`onAdditionalDetails` is given. There is nothing for us to wire, and no
`_payment_details` to relay.

**Nothing in the library reads the URL.** No `URLSearchParams`, no `location.search`. A
redirect return is resumed by calling `checkout.submitDetails({ details: { redirectResult } })`
— a **`Core`** method (`core/core.ts:164-206`), not a Drop-in one. It returns `void`; the
outcome arrives on `onPaymentCompleted` / `onPaymentFailed`.

**The session blob is cached in `localStorage`, unreliably.** Key
`adyen-checkout__session`, holding only `{ id, sessionData }`, rehydrated **iff** the
constructor is given an `id` with no `sessionData` and the stored id matches. When
`localStorage` throws — private mode, a sandboxed iframe — the library silently swaps in an
in-memory store, so the blob does not survive navigation and the failure looks like a
generic `NETWORK_ERROR`. The library also never clears the entry.

**`showPayButton` belongs on the `Core`, not on the `Dropin`.** The Drop-in forwards only
`{ elementRef, isDropin }` to its children (`components/Dropin/elements/createElements.ts:50-62`),
so `new Dropin(checkout, { showPayButton: false })` visibly does nothing. It must be set on
`AdyenCheckout({ … })` or per method under `paymentMethodsConfiguration.card`.

**`dropin.submit()` throws when nothing is selected** — a plain `Error('No active payment
method.')` — and silently no-ops, showing validation, when the form is invalid
(`components/Dropin/Dropin.tsx:102-119`, `UIElement.tsx:254-271`). `dropin.isValid` is the
guard.

**A refusal leaves the instance usable but the form destroyed.** `handleFailedResult`
(`UIElement.tsx:479-486`) disables nothing and does not reset the status; `sessionData` is
refreshed even for a refused response, so the session is designed to be re-POSTed. But the
error screen unmounts the card subtree and with it the PCI secured-field iframes, so coming
back gives an empty form whatever route is taken.

**The two entry points cannot be mixed.** `@adyen/adyen-web` resolves to `dist/es` and is
tree-shakable but requires an explicit `paymentMethodComponents`; `@adyen/adyen-web/auto`
registers everything, is marked side-effectful, and resolves to `dist/es-legacy`. Importing
both puts two copies of the library in the bundle. This package already imports `/auto`, in
`payment_source/AdyenPayment.tsx:3-17`.

**`environment: 'live'` is enough, and `live_url_prefix` is not used.** v6 has zero
occurrences of it; it talks to `checkoutshopper-{test,live,live-us,live-au,live-apse,live-in,live-nea}.adyen.com`
(`core/Environment/constants.ts:1-10`). The regional variant is not derivable from anything
Commerce Layer exposes. `core/core.ts:90-101` throws synchronously on a `test_`/`live_` key
pointed at the wrong host.

**There is no session-expiry handling.** `expiresAt` is returned by `/setup` and never read.
An expired session surfaces as a generic `NETWORK_ERROR` and fires **both** `onError` and
`onPaymentFailed`.

**`enableStoreDetails` leaks past the server.** `components/Card/Card.tsx:82-88` is
`props.session?.configuration?.enableStoreDetails ?? props.enableStoreDetails` — nullish, so
when the session says nothing the client's value decides, and `enableStoreDetails: true`
alone renders the save checkbox and emits `storePaymentMethod`. Compare `installmentOptions`
in the same file, where the session wins hard and warns. The default is `false`, so nothing
bites us, but the asymmetry is worth knowing.

**`paymentMethodsResponse` takes priority over the session's own list**
(`core/core.ts:391-393`), so stored cards can be *painted* client-side without a
`shopperReference`. They cannot be charged. Never pass it.

## Decision

### The Drop-in charges; `<PlaceOrderButton>` starts it

`showPayButton: false` on the `Core`, and `<PlaceOrderButtonPaymentSessions>` calls
`dropin.submit()`.

The alternative — let the Drop-in's own Pay button charge — bypasses the
privacy-and-terms gate, which
`2026-08-18-place-order-split-by-payments-model.md` establishes as *"a legal requirement of
the checkout, not a property of the payment model"*. It also buys nothing: the money and the
placement are separated by an asynchronous callback either way, so the continuation machinery
is needed identically. It would add a second button and remove a legal gate in exchange for
no code saved.

Payment and placement are therefore two moments, and the second is reachable from **three**
entry points: the Drop-in completing in page, the Drop-in completing after a redirect
return, and a session that already carries an authorization when the page loads.

**`placeOrderWithPaymentSessions` is not modified.** It already does the right thing:
`needsAuthorization` skips a session that has one, the authorization it creates stays
`pending`, `hasAuthorizationInFlight` makes the loop wait rather than report, and an order
placed by `auto_place` is recognised by the `status === "placed"` branch. `requires_action`
stays out of `IN_FLIGHT_TRANSACTION_STATUSES` (`payment_sessions/types.ts:78-85`) because
this flow never reaches it.

### The gateway handoff is a store, and it is gateway-neutral

`<PaymentSettingAdyenPayment>` and `<PlaceOrderButton>` are siblings in a checkout, not
parent and child, so context cannot carry the call. The handoff is an external store read
through `useSyncExternalStore` and keyed by order id — the idiom this model **already chose**
for the same problem: terms acceptance travels through `utils/termsAcceptanceStore.ts` and
`hooks/useTermsAndConditions.ts:32-56`, not through context, for exactly this reason.
`PlaceOrderContext` stays exclusive to the `payment_source` model.

A gateway registers `{ submit, isReady }` plus the redirect `resumePhase`. `submit()` resolves
— never rejects — with one of **four** outcomes, because `dropin.submit()` returns `void` and
every result arrives by callback:

- **`completed`** — money taken, run the place sequence.
- **`incomplete`** — the form is empty or invalid. `dropin.submit()` shows Adyen's own
  validation and settles nothing, so without this the caller would wait forever. Nothing to
  report: this is a stop, not a failure.
- **`failed`** — a verdict, carrying Adyen's `resultCode`. No money moved, so a rollback is
  safe.
- **`unknown`** — a network failure, an expired Adyen Session, an SDK error. Emerged while
  writing the code: `onError` and `onPaymentFailed` are different events, and collapsing them
  would have made the rollback unsafe. **The payment may have gone through**, so nothing is
  refunded and nothing is deleted — refunding could take back money for a card that did
  charge, and the Payment Session is the record Adyen's webhook settles against. This is
  `placeOrderWithPaymentSessions`'s `timedOut` reasoning, one step earlier.

The contract is **neutral** — "if a gateway has registered a handoff for this order, await
it" — not because Stripe is next, but because it keeps the button shallow. A button that
knew about setting types and about the Adyen component's shape would be deeper than it needs
to be, which is precisely how `PlaceOrderButtonPaymentSource` reached 598 lines.

### Gift cards are authorized before the submit

The place handler authorizes the gift cards, then calls `submit()`, then calls
`placeOrderWithPaymentSessions` — which skips the gift cards it finds already authorized.

This preserves the charge order that `2026-08-20-gift-cards-as-payment-sessions.md`
established, and it is only possible because we own the submit: if Adyen's own button started
the charge, that moment would not be ours.

**The order is refetched between the two.** `placeOrderWithPaymentSessions` skips a session
that already carries a live authorization by reading the order it was *handed*, so passing the
pre-authorization copy on would authorize the same cards again and take the money twice. The
refetch is not a refresh for the screen's benefit; it is what makes that skip work. It also keeps the property that makes the
flow forgiving — a gift card is removable for free right up to the point the shopper commits.

The exposure it creates is real and it has a remedy: a refused card leaves gift cards
charged, and the API grants exactly the refund needed to undo that (gift card sessions, order
`pending`). Reversing the order would trade a **common** failure for a **rare** but
**unrecoverable** one: a card charged for the remainder with the gift cards unpaid,
`canAddGiftCard` already false, and no way out.

### A refused payment burns the Commerce Layer session

Delete the `payment_session` best-effort and never retry on it. **Nothing is created in its
place.**

Retrying in place walks into the AASM transition described above, and the timing is not
observable from the browser: immediately after the refusal the `failed` authorization has not
yet arrived, so the session still reads as the current selection and as reusable. Deleting is
deterministic where waiting is not.

The two mechanisms cover the same hole from opposite sides. If the delete succeeds, the order
is clean and reuse cannot find it. If it fails — because the `failed` authorization landed and
`dependent: :restrict_with_exception` blocks it — then `findCurrentPaymentSession` and
`findReusablePaymentSession` exclude it anyway, both already rejecting a terminal-failure
authorization. Failures are swallowed, following `invalidateCurrentPaymentSession`.

Local state saying "this session is burnt" was rejected: it is a second notion of a valid
session living in the browser, which the lifecycle ADR has already turned down once.

**The delete belongs to `<PlaceOrderButton>`, not to the gateway component**, and the first
implementation had it the other way round. Two reasons, both found by building it:

1. The button also decides whether the gift cards are given back, and a refund changes what is
   left to pay. A replacement created by the gateway component would be sized for the
   pre-refund remainder.
2. Re-selecting the setting to get a fresh session does not work from inside the failure
   handler. `selectSetting` reuses before creating, and it reads the order held in context —
   which still contains the session just deleted. It would adopt it, handing the shopper back
   the same burnt Adyen Session.

So the shopper re-picks the payment method after a refusal. That is one extra click, and it is
also how they see that their gift cards came back and the amount changed.

**On the redirect path the gift cards are not refunded.** They were charged on a previous page
load, and which of them *this* attempt authorized went with it — so giving them back could
take money for a payment that is still settling. They stay applied and visible on the order,
the stance `2026-08-20-gift-cards-as-payment-sessions.md` already takes for a timed-out place.
The burnt session is still deleted.

### The redirect return is resumed headlessly, and the library places the order

The redirect is **not optional**. `nativeThreeDS: 'preferred'` is hard-coded server-side for
every Adyen payment, so the variant is the issuer's choice, not ours: a card not enrolled for
native 3DS2 redirects whatever we configure. Restricting the offered methods does not avoid it.

Resuming needs no DOM. `submitDetails` is a `Core` method, so the resume is

```
AdyenCheckout({ clientKey, environment, session: { id, sessionData }, onPaymentCompleted, … })
checkout.submitDetails({ details: { redirectResult } })
```

with no container, no mount and no UI. It therefore lives in an internal hook called by
`<PaymentSetting>`, which the lifecycle ADR **already requires** to stay mounted — so the
resume cannot be lost to an application's decision about which step to render. Putting it in
`<PaymentSettingAdyenPayment>` would make it depend on that decision, and an accordion that
renders the payment step collapsed after a reload would leave a charged card on an unplaced
order. That is how the playground's redirect breaks, by a different route.

`{ id, sessionData }` come from `order.payment_sessions[].response_data`, not from the
`sessionId` query parameter. The order is the source of truth, and it is the only version
that survives a different browser, cleared storage or private mode — where adyen-web's
`localStorage` cache silently is not there.

`redirectResult` is single-use, so the resume is latched by a ref and the URL is cleaned with
`history.replaceState`.

**In this one path the library places the order without a click, and skips the terms gate.**
Terms acceptance does not survive the navigation, and requiring it again would leave anyone
who declines with a paid, unplaced order. The reasoning that makes this defensible is that
acceptance already happened *before* the redirect — without it the place button was not
clickable. The library exposes `isResumingRedirect` so an application can render the checkbox
as accepted and disabled and the button as pending; that presentation is the application's,
per `2026-09-01-presentation-belongs-to-the-application.md`.

### Saving a card uses Adyen's wallet, not Commerce Layer's

Send `_internal_version: "Tokenization"` when the token is an authenticated customer's, and
let the Drop-in render its own native save checkbox and its own saved cards.

The gate is `!isGuestToken(accessToken)` (`utils/isGuestToken.ts`), **not**
`order.customer != null`. Commerce Layer puts a customer on nearly every order that has an
email, and `Customer#shopper_reference` falls back to the email — so gating on the order
would store a token against a guest's email and show that card, with its last four digits and
expiry, to the next visitor who types the same address. There is precedent for the token gate
in this repository: `reducers/PlaceOrderReducer.ts:257-263` gates
`_save_payment_source_to_customer_wallet` the same way.

Commerce Layer still creates a `payment_wallet` server-side from Adyen's
`RECURRING_CONTRACT` webhook. **We do not read it.** An organization that does not want the
records disables that webhook — note it is `RECURRING_CONTRACT`, a standard notification, not
Adyen's separate Tokenization webhook (`recurring.token.created`), which the playground's ADR
0003 says must not be enabled at all because Commerce Layer 500s on it. Not verified by us.

No remove control is rendered. `onDisableStoredPaymentMethod` needs an Adyen API key we do not
have, and `showRemovePaymentMethodButton` is `false` by default. The gap is missing
credentials, not a choice.

### Setting-type-specific create attributes live in a table

`client_data.return_url` and `_internal_version` must be on the `POST` — the Adyen session is
built there and `_refresh` is inert — and the `POST` is made by `<PaymentSetting>`, which
today knows nothing about any gateway.

A declarative table beside `IMPLEMENTED_SETTING_TYPES` maps a setting type to the extra
attributes its creation needs. Not an `if` — `<PaymentSetting>` already carries one branch for
gift cards and one for unimplemented types, and a third would start a pattern. Not moving
creation into `<PaymentSettingAdyenPayment>` either: that breaks the invariant the whole model
rests on, that **the selection is the session**. With creation deferred to a child, nothing
exists for `findCurrentPaymentSession` to read, the radio does not light up, and a reload loses
the choice.

The return URL is **built, not copied**: origin plus pathname, the query preserved minus
`redirectResult` and `sessionId`, the fragment dropped. A raw `window.location.href` bakes a
previous attempt's `redirectResult` into the next session, and a checkout using a fragment
would have Adyen append its query *after* the `#`. There is no prop: the value is computed
where the session is created, and a prop there would sit on a generic component.

### What the shopper is told

`{ code: resultCode }` and no message.

`onPaymentFailed` gives only `resultCode` — `Refused`, `Cancelled`, `Error`. `refusalReason`
does not exist in this API, and `payment_authorization.response_data` is withheld from our
tokens. There is nothing else. Writing copy here would put payment wording, in one hard-coded
language, in a package that cannot know the checkout's locale — the problem mfe-checkout
already works around by passing `label` to the gift card buttons. `resultCode` *is* a code, it
comes from Adyen, and the application maps it.

`disableFinalAnimation: true`, because the session is recreated on a refusal and Adyen's error
screen would only flash before the remount.

### Configuration surface

Flat props on `<PaymentSettingAdyenPayment>`, not a config object:
`environment?`, `locale?`, `containerClassName?`, and `children?` as a function receiving
`{ isReady, isSubmitting, isResumingRedirect, errors }`. The legacy `AdyenPaymentConfig` —
eleven keys, one already `@deprecated`, three callbacks — is what
`2026-09-01-presentation-belongs-to-the-application.md` stopped doing.

- **`clientKey`** is not a prop. It is `setting.public_key`, from the
  `available_payment_settings` include this library already registers for every consumer
  (`hooks/useOrderState.ts:129-146`).
- **`environment`** defaults to `test` for a `test_`-prefixed key and `live` otherwise, and
  the prop exists for the regional live endpoints, which nothing in the API can tell us. Note
  the divergence: `payment_gateways/AdyenGateway.tsx:70` derives it from the JWT `test` claim
  instead. The key prefix is the better source — it is the value that must match the host, and
  adyen-web throws on a mismatch — but the two Adyen components in this package now disagree,
  deliberately.
- **`locale`** is exposed with its constraint documented: adyen-web builds `i18n` once and
  ignores later updates, so changing it on a mounted Drop-in requires a `key` that remounts.
  mfe-checkout does not need this (its language is fixed at load), a custom checkout might.
- **`@adyen/adyen-web/auto`**, matching the legacy component, and `allowPaymentMethods:
  ["scheme"]` on the `Core`. With `/auto` everything is registered, and
  `paymentMethodComponents` only *adds*, so `allowPaymentMethods` is how one restricts.
  Restricting is not about the bundle: Apple Pay, Google Pay and PayPal inside the Drop-in
  render their own pay buttons and submit themselves, which would bypass `<PlaceOrderButton>`
  and the terms gate — the one property the whole design is built on.
- **The component renders its own mount target, and `children` renders after it.** Everywhere
  else in this library a function child *replaces* the default markup. Here it cannot: the
  Drop-in attaches to that element, so handing it to a render prop would let an application
  that forgot to render it produce a payment form that silently never appears. `children` is
  for the chrome around it. Found by writing the mfe-checkout side — which is the ADR on
  presentation earning its keep a second time.
- **`adyen.css` is imported by the application**, not by the package. 138 KB is not a cost to
  impose on every consumer that does not use Adyen, and the import is fully manual — no file
  in the package pulls it in. Theming needs nothing from us either: all 136 `--adyen-sdk-*`
  tokens are `var(name, fallback)` with no `:root` block, so an application scopes a theme by
  declaring them on a wrapper.

### Placeability attempts are per-gateway

The global defaults stay as they are — `DEFAULT_PLACEABLE_ATTEMPTS = 8` at
`DEFAULT_PLACEABLE_INTERVAL_MS = 500` — because they are right for manual and gift card, whose
authorization is a local Sidekiq job. The Adyen branch passes its own, longer and more spaced:
the wait is a **webhook round trip from Adyen**. Four seconds is not it.

Exhausting them is still **not** a payment failure. The webhook may arrive a moment later, and
what to show then is the question the place-order ADR leaves open.

### Two fixes to `<PaymentSetting>` that are not about Adyen

Both are pre-existing, both live in the lines this work already touches.

- **Settings with `disabled_at` are filtered out.** `available_payment_settings` does not do
  it, and `<PaymentSetting>` did not either, so a disabled gateway was still offered.
- **An Adyen setting with no `public_key` is skipped**, with the same development-only
  `console.warn` used for unimplemented types, saying why. `public_key` is optional and
  unvalidated server-side, so this is reachable on a working organization. The lifecycle ADR's
  reasoning applies unchanged: a radio button that does nothing when clicked is worse for the
  shopper than no radio button. From the shopper's side the case is indistinguishable from an
  unimplemented setting — the option cannot be used.

## Considered options

- **Let the Drop-in's Pay button charge, and force the place button afterwards** — the legacy
  `placeOrderButtonRef.current.click()` with `disabled = false`. Rejected: bypasses the terms
  gate, needs the same continuation machinery anyway, and re-imports an escape hatch the new
  model was split to avoid.
- **Require another click after a redirect return.** Rejected: the card is already charged, so
  anyone who does not re-accept the terms is left with a paid, unplaced order.
- **Resume the redirect from `sessionId` in the query string**, as Adyen's own documentation
  assumes. Rejected in favour of the order, which survives a different browser and private
  mode. adyen-web's `localStorage` cache remains the fallback if the stored blob turns out to
  be required.
- **Retry a refused payment on the same session** (`dropin.setStatus('ready')`). Rejected: the
  `succeed!`-from-`failed` transition means the retry's success never lands.
- **Track burnt sessions in local state.** Rejected: a second notion of session validity in the
  browser.
- **Commerce Layer's `payment_wallets` as the source of truth for saved cards**, as the
  playground's ADR 0003 decided. Rejected *for this flow*: reuse there runs through the
  advanced flow and an integration token. Not a contradiction of that ADR so much as a
  different flow with a different constraint.
- **Gate `Tokenization` on `order.customer`.** Rejected: shows a saved card to anyone who types
  a known email address.
- **The tree-shakable `@adyen/adyen-web` entry point with `paymentMethodComponents: [Card]`.**
  Rejected: the legacy component imports `/auto`, and mixing entry points ships two copies of
  adyen-web.
- **Gate the place button on `dropin.isValid`.** Rejected: validity changes on every keystroke,
  and subscribing across the seam would re-render the button on each character. A disabled
  button with no explanation is also worse than a form that shows its own validation. `isReady`
  is exposed so an application that wants the behaviour can build it.
- **A `config` object prop, mirroring `PaymentMethodConfig`.** Rejected by the presentation ADR.
- **Restricting the Drop-in to avoid the redirect.** Impossible — the redirect is the issuer's
  choice.

## Consequences

**`placeOrderWithPaymentSessions` and `payment_sessions/types.ts` are unchanged.** The core
domain layer needed nothing for the first card gateway. That is the strongest evidence the
place-order split was cut in the right place.

**A refused card costs the shopper their typed card details, and their payment-method
selection.** Adyen's error screen unmounts the PCI secured-field iframes, so the form is empty
on every route back — including "retry the same card" — and deleting the burnt Payment Session
leaves the radio group with nothing selected.

**Deleting the burnt session can surface an older one as the selection.**
`findCurrentPaymentSession` takes the most recent live non-gift-card session, so a shopper who
tried bank transfer earlier on the same order sees that option selected again after a card
refusal. Not wrong — it *is* their most recent surviving choice, exactly as the lifecycle ADR
defines it — but surprising, and it is the visible cost of not recreating the session.

**The redirect path ships without an end-to-end test.** `nativeThreeDS: 'preferred'` is
hard-coded server-side, so the variant cannot be provoked on demand; it happens only when the
card is not enrolled. Coverage is unit-level, reusing the `@adyen/adyen-web` mock idiom already
in `specs/payment_source/AdyenPayment.spec.tsx` — a `vi.hoisted` capture object and a
`FakeDropin` exposing `mount`/`submit`/`remove`/`handleAction`, which lets a test invoke the
handlers the component installed. This is not an oversight; it is the consequence of a
server-side default we cannot override.

**Two Adyen components in one package derive `environment` differently.** Deliberate, recorded
above, and it should converge when the legacy component is eventually retired.

**A consumer with a `fields[payment_sessions]` sparse fieldset breaks the Drop-in.** The Adyen
session is read from `payment_session.response_data`; an allowlist that omits it produces a
session the Drop-in cannot boot from. mfe-checkout restricts only `fields[orders]` and four
other types, so it is unaffected.

**Adyen locks a `clientKey` to authorized origins, matched on scheme, host and port**, and a
rejected origin is indistinguishable from a network failure — validation is server-side at
Adyen, and adyen-web surfaces a CORS block as `NETWORK_ERROR`. Local development against a real
organization needs the origin registered in Adyen's Customer Area. The playground documents
spoofing a production domain over HTTPS on 443 for exactly this reason.

**Nothing handles an expired Adyen session.** `expires_at` is a day, `_refresh` is inert, and
adyen-web never reads `expiresAt` — so a checkout left open past the window fails as a generic
network error. `findReusablePaymentSession` already excludes expired sessions, so re-selecting
produces a fresh one; what is missing is telling the shopper why.

### Assumptions this design rests on

Listed in order of what they would cost if wrong.

1. **Adyen accepts the initial `sessionData` after `/payments` has rotated it.** This is the
   pivot of the redirect resume, inferred from Adyen's own documentation telling integrators to
   re-instantiate with the values their server returned. If it is rejected, the fallback is to
   pass the `id` alone and let adyen-web rehydrate from `localStorage` — which is silently
   unavailable in private mode and from another browser. **Verify against the real gateway.**
2. **Correctness depends on a missing `else` in `core-api`.** `action_by_status` has no default
   branch, and that alone is why the authorization stays `pending` rather than landing in
   `failed`. `#authorize!` also lacks the `if result.status >= 300` check its sibling `#create`
   has. Nothing tests this. "Fixing" that asymmetry would kill every Drop-in payment *and*
   poison the webhook that would otherwise rescue it, because `succeed` cannot be reached from
   `failed`. **A regression spec in `core-api` pinning "a 422 from `/payments` leaves the
   authorization `pending`" is worth more than anything we can write here.**
3. **That `public_key` is served to sales-channel tokens is not spec-covered in `core-api`** —
   the `payment_setting_adyen` factory does not even set it. The attribute config and the read
   filter both say yes, and the playground reads it from a browser under a storefront token, but
   the guarantee the whole integration rests on is untested upstream.
4. **Disabling `RECURRING_CONTRACT` is how an organization avoids the `payment_wallets`
   records.** Taken as given, not verified. It is a standard notification an organization may
   rely on for other things.
5. **`resultCode: "Pending"` and `"Received"` are unreachable with cards only.** They map to
   Commerce Layer's `require_action` and `process` states, and `Pending` is in
   `ACTION_STATES[:require_action]` without a matching entry in `NEXT_ACTION_TYPES` — a
   `requires_action` authorization with `next_action_type: nil`. Restricting to `scheme` keeps
   us out of it; adding iDEAL or Klarna later walks into it.

### Payment Setting implementation status

Single source; the tables in `2026-08-18-payment-session-lifecycle.md` and
`2026-08-20-gift-cards-as-payment-sessions.md` point here.

| Setting | Type literal | Status |
| --- | --- | --- |
| Manual | `payment_setting_manuals` | ✅ implemented — `2026-08-18-payment-session-lifecycle.md` |
| Gift card | `payment_setting_gift_cards` | ✅ implemented — `2026-08-20-gift-cards-as-payment-sessions.md` |
| Adyen | `payment_setting_adyens` | ✅ implemented — client-side Drop-in, cards only, this ADR |
| Stripe | `payment_setting_stripes` | ⬜ not implemented |
| Braintree | `payment_setting_braintrees` | ⬜ not implemented |
| External | `payment_setting_externals` | ⬜ not implemented |

Deferred, each needing its own design: the Adyen advanced flow, express/wallet payments, saved
cards through Commerce Layer's `payment_wallets`, settling a partially-paid order, and
`autoSelectSinglePaymentSetting` — whose condition the lifecycle ADR works out but leaves
unwritten until the rendered list and the real one converge. With three of six settings
implemented, they have not yet.
