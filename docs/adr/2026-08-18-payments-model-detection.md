# Detect the Payments Model from the order

> Naming note: from this ADR onwards, files in this directory use a **date prefix**
> instead of a sequence number. Sequential numbers collide silently across parallel
> feature branches — two branches both pick the next number, both merge cleanly, and
> the directory ends up with duplicates. That already happened here: the two `0001-`
> files predate this convention and are kept under their historical names.

## Context

Commerce Layer has two mutually exclusive payment models, and an order is bound to one
for its whole life (see `CONTEXT.md` for the vocabulary):

- **`payment_source`** — `payment_gateways` + `payment_methods`, surfaced on the order as
  `available_payment_methods`, with at most one `payment_source` per order.
- **`payment_sessions`** — `payment_settings` + `payment_sessions`, surfaced on the order
  as `available_payment_settings`, with zero or more sessions per order.

API version `2026-05` is **purely additive**: it adds the new resources and relationships
without removing anything, so a single order response can legitimately carry **both**
`available_payment_methods` and `available_payment_settings`. The library must therefore
decide which model to drive from the order payload itself, not from configuration.

The library pins the API version for every consumer — `getSdk` passes
`apiVersion: API_VERSION` unconditionally (`packages/core-components/src/sdk/index.ts:58`).
No consumer can reach the API on `2017-08` through these components, so the detection only
ever has to distinguish the two payloads, never two versions.

### Load-bearing fact: the SDK's deprecation markers are wrong

`@commercelayer/sdk` v8 annotates the old-model relationships as gone:

```ts
// api-L7ji9S8h.d.ts:19497
available_payment_methods?: PaymentMethod[] | null;  // @deprecated Last available in API version 2017-08.
// api-L7ji9S8h.d.ts:19507
payment_method?: PaymentMethod | null;               // @deprecated Last available in API version 2017-08.
```

**This is inaccurate.** On `2026-05` those relationships are still served. Verified against
the running API. Anyone reading that JSDoc will reach the opposite conclusion and delete
the precedence rule below as dead code — it is not.

## Decision

Expose a pure, public hook `usePaymentsModel()` that derives the model from `OrderContext`:

| Condition | Result |
| --- | --- |
| `available_payment_settings` non-empty | `"payment_sessions"` |
| else `available_payment_methods` non-empty | `"payment_source"` |
| else (including "order not loaded yet") | `"undetermined"` |

**The precedence lives in the library, never in the consuming application.** When both
arrays are present the new model wins and the old flow is excluded entirely.

`<Order>` registers `available_payment_settings` in the order `include` for **every**
consumer, unconditionally. Without it, an absent array is indistinguishable from an array
that was never requested, and the derivation cannot be trusted. The two nested
session relationships are *not* global — `<PaymentSetting>` registers
`payment_sessions.payment_setting` and `payment_sessions.payment_authorization` when it
mounts, because only the payment UI needs them and they are the expensive part.

Old and new components **self-silence** by consulting this hook, so both trees can be
mounted side by side without a coordinator. No `PaymentsModelStrategy` component ships in
this iteration.

## Considered options

- **A `<PaymentsModelStrategy>` wrapper that mounts one branch.** Rejected *for now*, not
  on merit: with self-silencing components it saves the consumer a two-line conditional and
  nothing else. A public component is forever; a hook plus an inline `switch` is deletable.
  Revisit if mfe-checkout finds the manual switch tedious.
- **Have the application blank out `available_payment_methods` after fetching.** Rejected.
  It moves a domain rule into every consumer, and every consumer other than mfe-checkout
  will get it wrong. It also requires mutating an API response to make components behave.
- **Store the model in the order reducer at fetch time.** Rejected: duplicated state that
  can drift from the order it was derived from. A pure derivation cannot drift.
- **Register the nested session includes globally too.** Rejected: two levels of nesting on
  a collection, paid by every cart and product page that never mentions payment.

## Consequences

`"undetermined"` is a **real, observable state**, not a transient implementation detail.
Every consumer of the hook — the place-order router, the payment setting list, the
gift-card form — must render something sensible during that window. It lasts until the
order has been fetched with the include resolved.

Every application now pays one extra relationship (`available_payment_settings`) on every
order fetch, including carts that will never show a payment method. This is the price of
making the derivation trustworthy, and it was chosen deliberately over the alternative of
requiring each consumer to opt in.

Because the deprecation markers cannot be trusted, **verify payment semantics against
`core-api`, not against the SDK types or the public docs.** This rule is not specific to
this ADR — see the closing section of `2026-08-18-payment-session-lifecycle.md` for the
full list of documents found to be wrong.
