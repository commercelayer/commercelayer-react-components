# Payment Session lifecycle on the `payment_sessions` model

## Context

On the `payment_sessions` model the shopper's choice of how to pay is not an order
attribute — there is no `order.payment_setting`. The choice only exists as a
**Payment Session** created against a **Payment Setting**, read back through
`order.payment_sessions[].payment_setting`.

This ADR covers how the library creates, reuses and reads those sessions, and where the
**Payment Authorization** fits. The place-order sequence itself is a separate decision:
see `2026-08-18-place-order-split-by-payments-model.md`.

This iteration implements **`payment_setting_manuals` only**. Progress against the full
set is tracked at the bottom of this document.

### What the API actually does

Verified in `core-api`, because none of it is documented and parts of the SDK types and
public docs are wrong (see "Sources that are wrong", below).

**`amount_cents` is optional on create, and an explicit value is silently capped.**
`PaymentSessionCreate` requires only `payment_setting`. Omitting `amount_cents` makes the
server default it to the order's *remaining* amount, not the total:

```ruby
# app/models/payment_session.rb:181-189
def set_amount_cents
  self.amount_cents ||= default_amount_cents
end

def cap_amount_cents
  max = default_amount_cents
  return unless max
  self.amount_cents = [amount_cents, max].min if amount_cents
end
```

`default_amount_cents` resolves to `Order#session_amount_cents`, which — despite the name
— is the **remaining** amount: `total_amount_with_taxes_cents - sum(payment-taken sessions)`
(`app/models/concerns/order_amounts.rb:24-28`). The capping is silent, so sending an amount
is not merely redundant, it can produce a session that quietly differs from what was asked.

**`amount_cents` cannot be changed afterwards.** It is absent from `PaymentSessionUpdate`
("not updatable once the session is created"). Changing an amount means a new session.

**Session status is a 7-state AASM machine with no per-state timestamps.**

```ruby
# app/models/payment_session.rb:21-28 — initial: :unpaid
unpaid | authorized | voided | paid | partially_paid | refunded | partially_refunded
# :15
PAYMENT_TAKEN_STATES = %w(authorized paid partially_paid).freeze
```

The `payment_sessions` table has only `expires_at`, `created_at`, `updated_at` — there is
no `authorized_at`/`paid_at`. Transaction resources are the opposite: they *do* carry one
timestamp per state.

**Transactions share one state machine across all four types.** `PaymentAuthorization`,
`PaymentCapture`, `PaymentVoid` and `PaymentRefund` are STI subclasses of
`PaymentTransaction` and none defines its own states:

```ruby
# app/models/payment_transaction.rb:22-31 — initial: :pending
pending | requires_action | processing | succeeded | declined | failed | canceled | expired
```

**A session only counts once its authorization has succeeded.** The session transitions to
`authorized` from `PaymentAuthorization#change_session_status!`, which runs on
`after_commit ..., if: :succeeded?` (`payment_transaction.rb:82`). A `pending`,
`processing` or `failed` authorization leaves the session `unpaid`, contributing nothing.

**Authorizing a manual payment is asynchronous.** There is no manual-specific gateway class
(`PaymentSettingManual` is an empty subclass), so it falls through to
`Payment::Session::Base#authorize!`, which merely calls `transaction.succeed!` — but it
runs in a Sidekiq job (`Workers::PaymentTransaction`, queue `payments`) dispatched from
`after_commit :handle_session, on: :create`. The work is trivial; the hop is real.

## Decision

### Creation: eager, on selection, with reuse

Selecting a Payment Setting creates the Payment Session immediately. The selection *is* the
session — that is what makes it survive a reload.

Create with **`payment_setting` and `order` only**. Never send `amount_cents`; let the
server size the session against the remaining amount.

> **Superseded in one place.** Gift cards after the first *do* send an explicit
> `amount_cents`, because the server's remainder does not move until a session is
> authorized and gift cards are authorized at place time — so it would size every card for
> the whole order. See `2026-08-20-gift-cards-as-payment-sessions.md`. The rule above still
> holds for the session paying the difference, where the server must work out what is left.

Before creating, **reuse** an existing session when all of these hold:

- its `payment_setting.id` matches the selected setting, **and**
- `status === "unpaid"`, **and**
- `expires_at` is absent or in the future, **and**
- it has no `payment_authorization` in a terminal failure state
  (`failed`, `declined`, `canceled`, `expired`).

### Reading: the order is the only source of truth

There is **no local selection state**. The current selection is derived from the order on
every render by searching `order.payment_sessions` with the predicate above. Local state is
limited to a per-setting "operation in progress" indicator, which is not a selection.

The session is always **searched for**, never read positionally. `payment_sessions[0]` is
wrong today for orders carrying a gift-card session and will be wrong for everyone once
split payment is supported.

**The selection is single per order, and it is the most recent live session.** This
followed from the decision not to delete: switching setting leaves the previous session on
the order, so a per-setting reading of "is this selected?" would light up every setting the
shopper has ever tried at once — a radio group with several selections. Taking the newest
keeps the group coherent without deleting anything a token may be refused.

Consequence for the reuse rule above: with only one setting implemented, the *adopt* branch
is currently unreachable through the UI, because a reusable session already reads as
selected and the radio ignores a click on the current selection. What is reachable, and
covered by tests, is the retry path — a burnt session does not count as the selection, so
clicking again creates a fresh one. The adopt branch is kept because it becomes live as
soon as a second setting exists.

### Sessions that took no money are deleted; everything else is abandoned

> **Reformulated** by `2026-08-20-gift-cards-as-payment-sessions.md`. The constraint behind
> the original "never delete" was that a burnt session might not be deletable — not that
> deletion is always wrong. Removing a gift card, and invalidating a session whose amount is
> no longer correct, both require deleting; both only ever touch sessions that have taken
> nothing.

### Failed sessions are abandoned, not deleted

A session whose authorization failed stays `unpaid`, so it is outside
`PAYMENT_TAKEN_STATES` and contributes nothing to any total. The library leaves it on the
order and creates a fresh one.

Deleting is not merely unnecessary, it may be impossible: a sales-channel or customer token
can be refused the delete when a failed authorization hangs off the session.

### The authorization is created at place time, not at selection

Creating it on selection — as the `examples-new-payments` playground does — means choosing
a radio button takes the shopper's money, and changing their mind requires cascade-deleting
an accounting record. Deferring it to the place-order click keeps selection free and
reversible. See the place-order ADR for the full sequence.

### Setting types are filtered internally, with no public flag

`<PaymentSetting>` iterates `available_payment_settings` and renders nothing at all for
types the library does not yet implement. There is no `isImplemented` prop: a public flag
would only push the same decision onto every consumer, and it would need deprecating once
the family is complete.

The two failure modes are not symmetric. Rendering a radio button for an unimplemented
setting produces a control that does nothing when clicked — worse than omitting it.

## Considered options

- **Lazy creation** (radio is local state; the session is created by an explicit action).
  Rejected: it contradicts the definition of the Current Payment Session and loses the
  selection on reload.
- **Eager creation without reuse.** Rejected: because `amount_cents` is immutable, any
  remount or refetch that re-triggers the effect creates another session. This repo has
  already shipped that bug class twice — commit `242e64a3` and
  `0001-coalesce-payment-source-requests.md`.
- **Checking that the reused session's amount covers the order.** Rejected: since the
  server sizes the session, verifying the amount client-side means reimplementing the
  server's calculation — the same trap as deriving placeability locally.
- **Reading state from timestamps instead of `status`.** Attractive for transactions, but
  impossible for sessions, which have no state timestamps at all. Rejected for uniformity.
- **Reusing a session by creating a second authorization on it.** Rejected:
  `payment_authorization` is a singular relationship and there is no evidence the API
  accepts a replacement.
- **Deleting burnt sessions.** Rejected on both token permissions and necessity.
- **Skipping unimplemented settings but exposing `isImplemented` to the consumer.**
  Rejected — see above.

## Consequences

Status unions are **hand-written from the AASM machines** and are not in the SDK, which
types both as bare `string`. They must be written as
`"unpaid" | ... | (string & {})` so that unknown values stay assignable, and every branch
that decides on a status needs an explicit `default`. **These unions must be re-checked
against `core-api` whenever the SDK is upgraded.**

Repeated failed attempts accumulate orphan `unpaid` sessions on the order. They are inert,
but they are the reason every read must search rather than index.

Reading the selection back requires `payment_sessions.payment_authorization` in the order
`include`, not just `payment_sessions.payment_setting` — without it, a reusable session
cannot be told apart from a burnt one.

Because selection now round-trips to the API, the radio does not light up on click. A
per-setting pending indicator is required, and it is *not* the selection.

An organization on the new model with only unimplemented settings configured gets a
checkout with **no payment options and no explanation**. A development-only `console.warn`
fires whenever `<PaymentSetting>` skips a setting; it is not public API and should be
removed once the table below is complete.

`<PaymentSetting>` must stay mounted even when the order turns out to be on the older
model. It registers the payment-session includes, and that has to happen *before* the order
is fetched: adding an include afterwards does not trigger a refetch, so a component mounted
only once the model is known would never receive its data. Consumers that mount it
conditionally will see an order whose `payment_sessions` never expand.

### Known debt, due with the second setting

~~`<PaymentSetting>` holds one `errors` state for the whole list.~~ **Closed** by
`2026-08-20-gift-cards-as-payment-sessions.md`: gift card errors live on their own context,
because gift cards and the method turned out to be two disjoint sets with two separate UIs
rather than two entries in one list. No `<PaymentSettingErrors>` was needed.

**Auto-selecting a single setting is deliberately absent.** `<PaymentMethod>` offers
`autoSelectSinglePaymentMethod` and the symmetric prop belongs here, but the obvious
condition is a trap: `<PaymentSetting>` renders only the *implemented* settings, so "one
entry rendered" is not "one option offered". An organization with five settings configured
and one implemented would have its shoppers silently committed to bank transfer while the
card options it pays for stay invisible — and that is the situation for every organization
until the table below is complete.

The condition has to be `available_payment_settings.length === 1` on the raw array, plus
the setting being implemented and no live session already on the order. Deferred rather
than written blind: under the correct condition it cannot fire on any organization that
still has unimplemented settings, so it would ship untested against the real API. Pick it
up with the second setting, when the rendered list and the real one start to converge.

Note that selecting is not a neutral gesture on either model. Creating a Payment Session
makes `new_payments_engaged?` true and the API then stops serving
`available_payment_methods` — observed: an order went from one available method to zero the
moment its first session existed. The mirror of what writing `payment_method` does to
`available_payment_settings`. Whichever tree acts first commits the order for good, which
is precisely why neither may act without the shopper.

### Payment Setting implementation status

| Setting | Type literal | Status |
| --- | --- | --- |
| Manual | `payment_setting_manuals` | ✅ implemented |
| Stripe | `payment_setting_stripes` | ⬜ not implemented |
| Adyen | `payment_setting_adyens` | ⬜ not implemented |
| Braintree | `payment_setting_braintrees` | ⬜ not implemented |
| External | `payment_setting_externals` | ⬜ not implemented |
| Gift card | `payment_setting_gift_cards` | ✅ implemented — see `2026-08-20-gift-cards-as-payment-sessions.md` |

### Gift cards

On this model a gift card is spent by creating a Payment Session against a
`payment_setting_gift_cards` setting. It is therefore a payment, not an order-level code —
the full lifecycle is in `2026-08-20-gift-cards-as-payment-sessions.md`.

`GiftCardOrCouponForm` pins its code type to
`coupon_code` whenever the model is `payment_sessions` — **overriding an explicit
`codeType="gift_card_code"` prop**. Writing `gift_card_code` on the order is meaningless
here, and allowing it through would silently apply a gift card that no session reflects.
`GiftCardOrCouponCode` and `GiftCardOrCouponRemoveButton` follow the same rule; their
`managePaymentProviderGiftCards` branch is Adyen-specific and unreachable on this model.

The coupon and the gift card end up in different places on this model, and deliberately:
the coupon is a discount and belongs with the order summary, while the gift card is a
payment and belongs in the payment step. Putting a control that creates a payment session
next to the discounts would have the total drop as if it were a coupon, while the card is
in fact charged at place time.

This supersedes the "gift cards are undecided and out of scope" ambiguity previously
flagged in `CONTEXT.md`.

## Sources that are wrong

Three official sources were found to contradict `core-api` during the design of this work.
**Verify payment semantics against `core-api`, not against the SDK types or the docs.**

1. `available_payment_methods` / `payment_method` are annotated
   `@deprecated Last available in API version 2017-08` in the SDK types. They are still
   served on `2026-05`.
2. `payment_type` is documented with the example `"manual_payment"`
   (`config/attributes/payment_transaction.yml:36`). The values the code produces are
   uppercase — `MANUAL`, `GIFT_CARD`, `STRIPE`, … — derived from the setting's class name
   (`app/models/payment_setting.rb:36-38`).
3. `PaymentSession.status` and `PaymentTransaction.status` are typed as bare `string` in
   the SDK with a single `@example` each. The real value sets are the AASM machines quoted
   above.

A fourth, for honesty: during this design `ensure_pending` was assumed from its name to
require a pending order. It does the opposite — it *promotes* a draft order and returns
`true` for every other status (`app/models/order.rb:966-969`).
