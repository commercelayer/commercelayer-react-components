# Split PlaceOrderButton into two branches behind a router

## Context

`PlaceOrderButton` cannot be adapted to the `payment_sessions` model by adding a guard.
Its enablement machine is built entirely on concepts that model does not have.

The upstream permission check hard-blocks every non-free order:

```ts
// PlaceOrderReducer.ts:107-149
total_amount_with_taxes_cents !== 0 && isEmpty(payment_method?.id)  // → not permitted
```

`order.payment_method` does not exist on the new model, so **every non-free order would be
permanently disabled**. And the block is not a single `if`: the same reducer publishes
`paymentType = payment_method.payment_source_type`, and the button's enablement effect
(`PlaceOrderButton.tsx:103-161`) cross-references it with `currentPaymentMethodType`,
`order.payment_source.payment_response.status`, `getCardDetails(...).brand` and
`currentPaymentMethodRef.current.onsubmit` — four concepts with no counterpart.

Below that sit five gateway-specific auto-place effects for redirect returns (PayPal payer
id, Stripe payment-intent polling, three Adyen branches guarded on `merchantReference`,
Checkout.com session id, plus an Adyen gift-card callback on an already-placed order), and
a three-branch validation tree inside `handleClick` with a `partially_authorized` override.
Of 598 lines, what carries over is the button ref, the render-prop and
`setPlaceOrderStatus`.

The constraint from the consuming side is that **the component hierarchy a consumer mounts
must not change**. An application on v5 must upgrade without editing its component tree.

### What the API actually does

Verified in `core-api`.

**`_placeable` is a validation, not a read.** The SDK sends it as
`PATCH /orders/:id` with `attributes: { _placeable: true }`, wired as
`validate :placeable?, if: -> { truthy?(@_placeable) }` (`app/models/order.rb:303`).
On success it returns **200** with the whole order and the transient attribute
`placeable: true`; on failure **422** with a JSON:API `errors` array. Because a failed
validation persists nothing, repeating the call is cheap and side-effect free.

**`placeable` is never served on a GET.** It is an `attr_accessor`
(`app/models/order.rb:371-378`) exposed as `"transient": true, "actions": ["update"]`, so
it appears only in an update response. It cannot be polled by refetching the order, and it
cannot gate a button on render.

**Coverage is enforced by a default payment rule, not by a hard-coded guard.** On the new
model `validate_payments` is a no-op — both `validate_payment_method` and
`validate_payment_source` return `true` when `new_payments?`
(`app/models/concerns/order_payments.rb:426-447`) — and no guard in `PLACE_GUARDS` reads
`session_amount_cents`. What does enforce payment is `validate_payment_rules` plus a rule
every market auto-creates:

```ruby
# app/models/market.rb:16, 31, 155-159
DEFAULT_PAYMENT_RULE = { template_id: "08ddf06d-...", template_settings: { "value" => 100.0 } }.freeze
after_save :create_default_payment_rule!
```

The threshold is a **rule parameter**, so an organization can lower it to accept part
payments.

**`ensure_pending` does not block an already-placed order.** It promotes a draft and
returns `true` otherwise (`app/models/order.rb:966-969`), so `_placeable` on a placed order
returns 200 rather than an error. This matters because `auto_place` on a Payment Setting
places the order inside the authorization job (`app/models/payment_session.rb:32-35`),
before the client can observe it.

## Decision

`PlaceOrderButton` becomes a **pure router** over two implementations:

- `PlaceOrderButtonPaymentSource` — the current file, **moved unchanged**. Not a refactor:
  the 598 lines keep their git blame and their existing specs.
- `PlaceOrderButtonPaymentSessions` — new.

The router selects on `usePaymentsModel()`. The public props are unchanged; `options`
(`paypalPayerId`, `stripe`, `adyen`, `checkoutCom`) is forwarded **only** to the
`payment_source` branch.

While the model is `"undetermined"` the router renders a **neutral disabled button** — not
the old branch, and not `null`. Defaulting to the old branch would mount five redirect
effects that read `payment_source.payment_response` on an order that has none; rendering
`null` makes the button appear late, which is a visible change even though the mount
hierarchy is identical.

`PlaceOrderContext` stays exclusive to the `payment_source` model. The new branch has no
children to serve, and `PrivacyAndTermsCheckbox` already communicates through the
`PLACE_ORDER_RECHECK_EVENT` DOM event rather than context. A consumer that still mounts the
deprecated `<PlaceOrderContainer>` above a new-model order is harmless: the router ignores it.

The privacy-and-terms gate applies to **both** branches. It is a legal requirement of the
checkout, not a property of the payment model.

### The new branch's sequence

1. Create the **Payment Authorization** against the current Payment Session.
2. Poll `_placeable`: **5 attempts, 1 second apart**, by default.
   - **200** → read `order.status` from the returned order.
     `"placed"` → the order was auto-placed; skip step 3 and report success.
     Otherwise → step 3.
   - **422** → wait and retry. Do **not** surface the errors yet.
3. `_place`.
4. If the attempts are exhausted, surface the errors from the **last** 422.

Retrying before reporting is the point of the loop, not an optimization. Authorization is
asynchronous, so the first `_placeable` legitimately fails with "the payment doesn't cover
the required percentage" while the job is still in flight. Reporting that immediately would
tell the shopper their payment failed a second before it succeeded.

**No client-side coverage gate.** Since the threshold is a configurable rule, a local check
such as `session_amount_cents === 0` would block an order that an organization has
deliberately made placeable with a part payment. Only the server knows the threshold.

Each 422 error maps to one `BaseError`: `field` from the last segment of
`source.pointer` (`/data/attributes/<attr>`, or `base` for `/data`) and `code` from
`meta.error`. One error per reason, so the consumer can address them individually rather
than parsing a concatenated message. Populating `field` also keeps the existing
non-blocking-error filter (`PlaceOrderButton.tsx:162-174`, which exempts coupon and
gift-card fields) working unchanged.

Attempts and interval are a **parameter of the domain function** in `core-components` and a
prop on `PlaceOrderButtonPaymentSessions`, which forwards it.

## Considered options

- **Route inside the existing component.** Rejected: two disjoint state machines in one
  file, with the first one untouchable by constraint.
- **Generalise `PlaceOrderContext` to cover both models.** Rejected: it couples the two
  machines at the exact seam we are separating.
- **Enable the button from `order.placeable`.** Impossible — it is not served on a GET —
  and wrong even if it were: it does not become true until the asynchronous authorization
  has succeeded, so it would disable the button precisely while payment is in progress.
- **Derive placeability client-side from session amounts.** Rejected: reimplements a
  server rule that organizations can extend, and breaks any organization using a threshold
  below 100%.
- **Poll `order.session_amount_cents` by refetching, then call `_placeable` once.** This
  was the earlier decision, taken while `_placeable`'s contract was unknown. Superseded:
  `_placeable` returns the actual reasons and, on failure, persists nothing, so a second
  mechanism buys nothing.
- **Call `_place` directly and use its errors.** Tempting, because `_place` short-circuits
  on an already-placed order (`(placed? || placeable?)`, `app/models/order.rb:900-908`).
  Rejected: it erases the distinction between checking and acting, so every silent retry
  would be a real attempt to place.

## Consequences

The router must render a button itself for the `undetermined` window, so `label` and the
render-prop are handled at that level too, not only inside the branches.

**A 200 from `_placeable` is not proof of payment.** Three routes bypass the coverage rule,
none of them defensible from the client:

1. The default rule is an ordinary row with no delete protection — it can be removed,
   disabled, expired, or its threshold lowered.
2. It is created by an `after_save` on Market with **no backfill migration**, so markets
   never re-saved since the feature shipped do not have it.
3. `validate_payment_rules` returns early when
   `!new_payments_engaged? && (old_payments? || old_payments_engaged?)`. A `new_payments?`
   order with zero sessions but a leftover `payment_method_id` skips rule evaluation
   entirely, and since every other guard is a no-op on this model, **it places uncovered**.

All payment-rule failures arrive with the same `field: payment_action`
(`app/models/business_rule/payment_action.rb:5`), distinguishable only by message text. A
consumer cannot programmatically tell "not covered" from "payment setting not allowed" and
can only display the message.

The authorization worker is configured `retry: 0` (`app/lib/workers/base.rb:16`), so a
failed job never retries and the authorization stays `pending` **forever**. Exhausting the
attempts is therefore a reachable steady state, not just a slow path. It is reported as a
recoverable condition inviting another attempt — never as a payment failure, and never by
deleting anything, since the payment may in fact have succeeded.

### Open: what a timeout should actually show the shopper

Reporting the last refusal is a placeholder, not a considered answer. It tells someone whose
payment is still settling that something went wrong.

The direction to explore, in a grilling session of its own: always land on a thank-you page
carrying a payment-status summary and a refresh control, and — when a payment did fail —
re-offer the payment components there so the shopper can settle the remainder and the order
finally reads as paid. That reframes the timeout as "we are still checking" rather than an
error, which is what it actually is.

Not designed here because it reaches past this component into checkout navigation and into
what happens after placement, and deserves its own set of questions.

Until then: on timeout, nothing is rolled back. A gift card authorized during a timed-out
attempt stays authorized and bound to the order, and its remove control disappears —
the money has been taken and only a refund could return it, which this iteration does not
implement.
