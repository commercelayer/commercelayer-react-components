# A loader while a payment setting loads, and a locked method while a payment is under way

**Date:** 2026-10-30
**Status:** accepted — covered by unit specs; not yet run in the browser
**Scope:** `<PaymentSetting>`, its gateway components and the Payment Gateway Handoff on the
`payment_sessions` model. Issues #901 (no loading state) and #842 (method switchable mid-payment).
The `payment_source` model's loaders are untouched.

## Context

Both issues are about the window between a shopper's gesture and the gateway's answer, seen from
the selector.

**#901.** Selecting a payment setting showed nothing until the gateway's form painted. There are two
waits, back to back: the Payment Session being created, which `<PaymentSetting>` already exposed as
`isPending`, and the gateway's SDK loading and mounting, which nothing exposed — `isReady` on the
gateway components means "filled in", not "on screen". The second wait is the longer one, and only
the library can see it. On the `payment_source` model `<PaymentGateway loader>` covers it, and
`2a4960c4` on main established for Adyen what holds for every SDK here: the loader goes **beside**
the mount target, never in place of it. `mount()` needs its node in the DOM, and swapping a mounted
form out loses what the shopper had typed.

**#842.** Nothing stopped a shopper from picking another setting while a payment was under way —
PayPal's window open, a card submitted and its 3DS challenge up. The switch unmounts the gateway that
is collecting, which discards whatever it had in flight without stopping the payment. The two
outcomes where money is taken and the order has nothing to show for it were already closed on
`feat/822-stripe-payment-settings`: Adyen settles a pending `submit()` on cleanup, and
`paymentGatewayStore` gained a `collecting` flag that `selectSetting` reads before deleting the
superseded session. The flag was deliberately kept out of the published snapshot until it was
decided what a checkout should do with it.

There is a tension with `2026-09-01-presentation-belongs-to-the-application.md`: a `loader` prop
renders something on the application's behalf. It is accepted here because the placeholder has to
sit next to a mount target only the gateway component renders, at a moment only the gateway knows —
an application handed only a flag could not put it in the right place for Adyen without reaching
into the component's DOM.

## Decision

### One `loader`, on `<PaymentSetting>`, rendered by each gateway

`<PaymentSetting loader>` takes the same `LoaderType` as the `payment_source` components and passes
it down through `PaymentSettingChildrenContext`. Each gateway component renders it, through
`usePaymentSettingLoader`, which also lets a gateway component's own `loader` prop win. Nothing is
rendered without one, so a checkout that passes none sees no change.

Each component shows it across both waits, with no gap: while `isPending` is true for its setting,
and then from mounting until its SDK says it painted. The hand-over has no gap because the order
refetch and `setPendingSettingId(null)` land in the same render, so the setting becomes selected —
and its form mounts, loader first — in the render that ends the pending state.

| Component | Painted when | Stops early when |
| --- | --- | --- |
| `<PaymentSettingStripePayment>` | Payment Element `ready` | `loaderror` |
| `<PaymentSettingAdyenPayment>` | Drop-in `onReady` | `/setup` refused |
| `<PaymentSettingBraintreePayment>` | Hosted Fields `create` resolved | the boot failed (a client-token renewal in progress keeps it up) |
| `<PaymentSettingPayPalPayment>` | button rendered (`isLoaded`) | PayPal unavailable |
| `<PaymentSettingManualPayment>` | — (session creation only) | — |

"Stops early" matters as much as "painted": a loader standing in for a form that is not coming is a
stuck checkout. `<PaymentSettingBraintreePayPal>` and `<PaymentSettingBraintreeApplePay>` render no
loader: they belong to the same setting as the card form, and three placeholders for one wait would
be two too many.

Stripe and Adyen gain `isLoaded` on their render props, as Braintree and PayPal already had, so an
application that prefers its own placeholder can drive it.

### The payment method locks while a payment is under way

`collecting` is published on the handoff snapshot as **`isCollecting`**, readable through
`usePaymentGatewayHandoff()`. While it is true:

- `selectSetting` does nothing, however it is called — radio, a card wired to it, anything.
- `<PaymentSettingRadioButton>` is disabled, on every setting.
- `<PaymentSetting>`'s function children receive `isCollecting`, so an application can grey out the
  alternatives and say why on the selected one, in its own words and locale.

`<PaymentSetting>` subscribes to the flag alone, not to the whole handoff, which also changes when a
form turns valid or invalid — every setting's subtree renders from it.

The delete guard in `selectSetting` stays. The lock refuses a switch begun mid-payment, but not a
payment begun mid-switch: the old gateway is on screen while the new session is created, and the
shopper can pay through it in that second.

### The lock is released by every outcome, and has no timeout

- Every path that sets it clears it on every outcome. Two were missing and are added here:
  `<PaymentSettingPayPalPayment>` and `<PaymentSettingBraintreePayPal>` took it only on approval, so
  PayPal's window could be open with the method unlocked. They now take it as the window opens and
  release it on cancel, on error, on a start refused for a gift card, and on approval being answered.
- Deregistration from the handoff clears it, as the net under a gateway torn down mid-payment.
  `<PaymentSettingBraintreePayPal>` registers nothing, so it releases its popup's hold on unmount —
  only that hold, since an approval already being authorized finishes and releases on its own.
- **No timeout.** A wallet sheet or a PayPal window can stay open for minutes, and unlocking under it
  would bring back exactly the switch this prevents. A cancelled window already reaches every
  gateway as a callback.

**The lock is the shopper's experience, not the payment's safety.** It does not survive a reload or
the back button. The session a payment settles against is protected on its own, by the delete guard.

### Abandoning a payment is out of scope

Closing the window or the sheet is how a shopper abandons today, and it releases the lock. An
explicit "abandon payment" control — and what it should do to a session and to gift cards already
charged — is left for a follow-up.

## Consequences

**A checkout gets a loading state by passing one prop.** mfe-checkout passes its `PaymentSkeleton`
to `<PaymentSetting>` and gets it under the selected setting, across both waits.

**The Braintree card form shows its labels next to the loader.** Hosted Fields mounts into
containers the form renders with their labels, and those have to be in the DOM; an application that
wants the labels hidden too can drive that from `isLoaded`.

**`isCollecting` is public API.** It is on `PaymentGatewayHandoff`, on `<PaymentSetting>`'s children
props and on its context.

**A selector can still look stuck to a shopper who is not told why.** The library disables the
radios; saying "payment in progress" is the application's job, through `isCollecting`.
