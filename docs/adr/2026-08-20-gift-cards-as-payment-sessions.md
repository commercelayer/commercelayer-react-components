# Gift cards as Payment Sessions

## Context

On the `payment_sessions` model a gift card is a **payment**, not a discount. It is spent by
creating a Payment Session against a `payment_setting_gift_cards` setting, and the order
total never changes.

That is the reverse of the older model, where a gift card became a negative line item and
`total_amount_with_taxes_cents` came back already net. The mechanism is switched off
entirely for new payments — `order.gift_card_applicator` returns a null object when
`new_payments?` (`app/models/order.rb:984-987`), and `GiftCardApplicator#call` self-guards
too — so `gift_card_amount_cents` stays at zero. The old `order.gift_card_code` attribute is
additionally hard-blocked once any session exists, raising a 400 `UNSUPPORTED`
(`order_payments.rb:195-198`, `:569-572`).

This is the **only** split payment this iteration supports: zero or more gift cards, plus at
most one other session for the difference. Anything wider is out of scope.

### What the API actually does

Verified in `core-api`.

**A gift card session is sized `min(remaining, balance)`** —
`app/models/payment/session/gift_card.rb:12-16`:

```ruby
def default_amount_cents
  total = session.session_amount_cents
  return total unless gift_card
  total > balance_cents ? balance_cents : total
end
```

**…but `session_amount_cents` only drops once a session is authorized.** It is
`total_amount_with_taxes_cents - sum(payment_taken sessions)`
(`order_amounts.rb:24-28`), and `payment_taken` is `authorized`/`paid`/`partially_paid`.
Merely applying a gift card moves nothing on the order.

**Authorizing a gift card charges it immediately and irreversibly-ish.**
`auto_capture?` is hard-coded `true` for the gift card client, so the authorization is
followed straight away by a succeeded capture and the session lands on `paid`
(`payment/session/base.rb:72-92`, `payment_capture.rb:20-22`). `authorize!` calls
`gift_card.use!`, which debits the balance. A **void always fails** by construction —
`void!` does `auto_capture? ? transaction.fail! : transaction.succeed!` — so the only way
back is a `PaymentRefund`, which calls `gift_card.restore!`.

**Deleting a session is allowed, until it has transactions.** A sales-channel token may
`destroy` a `PaymentSession` while the order is `draft`/`pending`/`editing`
(`sales_channel_ability.rb:20-22`), but has no `destroy` on authorizations, captures or
refunds. And `PaymentSession` declares its transactions
`dependent: :restrict_with_exception` (`payment_session.rb:76-82`), so deleting a charged
session raises `ActiveRecord::DeleteRestrictionError` — which is **not** in the exception
handler and surfaces as an unhandled **500**. Deleting an unauthorized session touches no
balance: nothing was taken.

**Several gift cards are allowed, with no maximum.** The only constraint is that the same
code cannot be applied twice while the first session is still `unpaid`
(`payment_session.rb:212-221`).

**Every bad-code reason collapses into one message.** No such code, expired, zero balance,
or bound to another market all fail the same lookup and produce
`gift_card_code: doesn't match any active gift card` (422, `source.pointer` ending
`/gift_card_code`). A duplicate gives `has already been taken`. There is no way to tell the
shopper *which* it was.

**Once coverage is complete the API gives no clean signal.** Creating another session
defaults its amount to zero and fails `numericality: { greater_than: 0 }` — a 422 about
`amount_cents` that means nothing to a shopper.

## Decision

### Two disjoint sets, not one list

Gift cards are a **list**; the difference is paid by **at most one** other session.
`findCurrentPaymentSession` excludes gift card types entirely, so it keeps governing the
radio group, and `derivePaymentSessionsState` returns the gift cards separately.

A gift card is not one of the alternatives the shopper picks between — it is applied on top,
and several are live at once. Putting them in the radio group would mean more than one
selection in a group with room for exactly one.

`<PaymentSettingGiftCard>` therefore sits **outside** `<PaymentSetting>`, which skips gift
card settings silently: they are implemented, just elsewhere.

### The remainder is derived, not read

`order.session_amount_cents` cannot be used: it stays at the full total for as long as the
shopper is choosing, because gift cards are authorized at place time. So
`derivePaymentSessionsState` computes

```
remaining = total − Σ(live gift card amounts) − Σ(authorized method amounts)
```

Gift cards count as soon as applied; a method session counts only once it has taken money,
because an unauthorized one is an intent, not a payment.

The amounts summed are the ones the **server** computed per session, so this is arithmetic
over server values rather than a reimplementation of its rules.

`isCovered` additionally requires `total > 0`. Without that guard an order fetched without
`total_amount_with_taxes_cents` in its `fields` reads as free, and coverage would hide the
entire payment step — which is exactly what happened before a spec caught it.

### An explicit `amount_cents` from the second card onwards

This is the one place the "never send `amount_cents`" rule is broken, and it has to be.

On a $71 order, a $50 card followed by a $100 card produces sessions of $50 and **$71** —
the server's remainder has not moved, so the second card is sized for the whole order.
$121 of credit for a $71 order, and nothing server-side prevents it.

Sending an amount is safe because `cap_amount_cents` clamps it **down** to what the server
would have allowed and never up, so the server stays the authority on the maximum. And the
number sent is a sum of amounts the server itself computed.

The rule still holds for the session paying the difference, where the server must be the one
to work out what is left.

**The `examples-new-payments` playground has this bug.** It applies every card without an
amount (`payment-section.tsx:1082-1106`) and never gates its input on the remainder
(`gift-card-section.tsx:66-79`). It is not a precedent to copy.

### Applying or removing invalidates the session paying the difference

`amount_cents` is set once and never updatable, so a session created against a different
remainder is not stale but *wrong*: it would still read as the shopper's selection, and at
place time we would authorize more than is owed.

Both operations therefore delete it, as part of the same domain operation — binding the
invalidation to the action that causes it, rather than to an effect somewhere comparing
amounts. Effects that delete resources in response to an amount comparison are the class of
code that has produced render loops and duplicate creations in this repo three times.

The cleanup swallows its own failures: it runs alongside an action the shopper asked for and
can see the result of, and turning a cleanup failure into a visible error would report the
wrong thing.

### Only what took nothing is deleted

This reformulates the earlier "never delete" rule without contradicting it. The constraint
behind that rule was that a burnt session might not be deletable — not that deletion is
always wrong.

**A session is deleted only when it has taken no money; everything else is abandoned.** A
charged gift card cannot be removed: the API would refuse and surface a 500, a sales-channel
token cannot clear the transactions, and only a refund would return the balance — which this
iteration does not implement. Its remove control is therefore not rendered at all, rather
than rendered and failing.

### Place: gift cards first, stop at the first failure

`placeOrderWithPaymentSessions` takes the order and authorizes the gift cards in sequence,
then the session paying the difference **if there is one** — gift cards can cover the order
outright.

Gift cards go first as a client-side safety property; nothing server-side enforces it. Each
authorization shrinks what the next session may take, and a gift card charged after a failed
method payment would leave the shopper's balance spent on an order that never got placed.

On a failure partway, it stops and reports. The cards already charged stay charged: carrying
on would only charge more for an order that is not going to be placed, and **no rollback is
implemented**. The gift card list is itself the recovery surface — after a reload the shopper
sees which cards were charged and what is left to pay.

On a **timeout** nothing is touched at all, because the payment may well have succeeded. See
`2026-08-18-place-order-split-by-payments-model.md`.

### Amounts on screen

`<TotalAmount>` deducts the gift cards on this model, restoring parity with the older one
where the total already came back net. It deducts the **gift cards only**, not everything
authorized: on the older model an authorized payment source never reduced the total shown.

`<GiftCardAmount>` sums the sessions, since `gift_card_amount_cents` stays at zero, and
shows the figure as a deduction.

Both branch off the same derivation as everything else. A consuming application that needs
the number outside these components uses `derivePaymentSessionsState`, so the figures cannot
disagree.

### Errors in two channels

Gift card errors live on the gift card context; the method's live on `<PaymentSetting>`.
Not one list filtered by setting: gift cards and the method are two disjoint sets with two
separate UIs, so a failure in one must never surface under the other. This closes the shared
error-state debt that was due with the second setting.

An error carries both a `code` we chose and the message the API sent, because a translated
consumer needs the former and the API's single collapsed message is the only detail
available.

## Considered options

- **One list of sessions with a flag, UI decides.** Rejected: pushes the same distinction
  onto every consumer.
- **Full split payment, N sessions of any type.** Rejected: rethinking the whole interaction
  for a case explicitly out of scope.
- **Authorize each gift card on entry**, so the server's remainder is always right.
  Rejected: it charges the card on entry and turns removal into a refund, losing the one
  property that makes the flow forgiving.
- **A single gift card.** Rejected: multiple was a requirement.
- **Leave the stale method session and exclude it by comparing amounts.** Rejected: a second
  notion of "valid session" based on a client-side amount comparison, and a session that
  looks like the selection but is not.
- **Recreate the method session at place time.** Rejected: moves a deletion into the moment
  money is being taken.
- **Read `order.session_amount_cents` for the remainder.** Impossible: it does not move
  until authorization.
- **`<GiftCardAmount>`/`<TotalAmount>` left alone, with a new remainder component.**
  Rejected: the shopper reads the existing figures, and showing them gross is the wrong
  number in the place they actually look.

## Consequences

**The shopper cannot be told why a code was rejected.** Four different causes arrive as one
message. Not a choice of ours — it is all the API gives.

**Nothing more can be applied once anything is authorized.** `canAddGiftCard` goes false as
soon as any session carries a live authorization, gift cards included. So after a timed-out
place — where the cards are already `paid` — no further card is accepted. This is the interim
answer while settling a partially-paid order remains undesigned; the target state is the
thank-you page with a payment summary described in the place-order ADR.

**`<TotalAmount>` no longer equals `order.total_amount_with_taxes_cents`** on this model.
Consumers doing their own arithmetic must use `derivePaymentSessionsState` rather than the
order attribute, or the page will contradict itself.

**An order fetched without `total_amount_with_taxes_cents` breaks the amounts.** The
`isCovered` guard stops it hiding the payment step, but the deduction and the remainder both
need the figure. Any consumer with a `fields` allowlist has to include it.

**Orphan sessions accumulate**, now from two sources: abandoned method sessions and the ones
invalidated on every gift card change. All are `unpaid`, so they are inert and contribute to
nothing — but it is why every read searches the array rather than indexing it.

### Payment Setting implementation status

| Setting | Type literal | Status |
| --- | --- | --- |
| Manual | `payment_setting_manuals` | ✅ implemented |
| Gift card | `payment_setting_gift_cards` | ✅ implemented |
| Stripe | `payment_setting_stripes` | ⬜ not implemented |
| Adyen | `payment_setting_adyens` | ⬜ not implemented |
| Braintree | `payment_setting_braintrees` | ⬜ not implemented |
| External | `payment_setting_externals` | ⬜ not implemented |
