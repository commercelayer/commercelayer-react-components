# Proposal: authorize the gift cards last

**Date:** 2026-09-09
**Status:** proposed — not implemented, pending a UI/UX decision
**Scope:** the order in which a partly-gift-carded order's sessions are authorized

## Why this is written down

Today the gift cards are charged **before** the gateway is asked for anything, on every method.
That ordering is not free: because each gateway takes its money at a different moment, "before
the money" had to be found separately for each one, and there are now four bespoke places where
gift cards get authorized.

| Method     | Where the gift cards are charged                           |
| ---------- | ---------------------------------------------------------- |
| Card       | in our own click handler, before `dropin.submit()`         |
| PayPal     | inside `onClick`, before the popup opens                   |
| Google Pay | inside `onAuthorized`, before `/payments`                  |
| Apple Pay  | the same, with the rejection dressed as an `ApplePayError` |

The proposal is to charge them **last** — after the gateway has said yes — and to treat a failed
gift card as a residual the shopper is invited to settle, rather than as a reason to abort.

## What it would simplify

This is the strongest argument for it, and it has nothing to do with risk appetite.

`placeOrderWithPaymentSessions` **already** authorizes every gift card as its first step, for
every method, with no hook at all. Charging them after the gateway means that is the only place
it happens. What could then be deleted:

- the `authorizeGiftCardSessions` call in the place handler's click path;
- the gift-card branch of PayPal's `onClick` — the terms gate stays, it is about the gate;
- **all** of the wallets' `onAuthorized`, and with it `plainError`, `appleError`,
  `applePayErrorCtor`, `WalletOnAuthorizedActions`, and the `selfAbortedRef` guard, which exists
  only because a rejected `onAuthorized` arrives on the same callback as a real refusal;
- the refetch between authorizing and submitting, which the Adyen ADR calls load-bearing.

And the question every new gateway currently has to answer — _where is the moment before the
money that we control?_ — stops existing. Stripe would not need an answer.

## What it would require

**One rule reopened.** `canAddGiftCard` is `remainingAmountCents > 0 && !sessions.some(holdsMoney)`,
with the comment "settling a partially-paid order is a flow this iteration does not implement".
With the gateway authorized, `holdsMoney` is true and the gift-card input stays shut — which is
half of the proposed recovery. Reopening it is the change, and its original reason _is_ this
proposal.

**The residual is already computed.** `isLiveGiftCard` drops a session whose authorization
failed, so such a card already disappears from `giftCardSessions`, stops counting toward
`giftCardAmountCents`, and `remainingAmountCents` reopens by exactly its share. Nothing to build.

**A new session for the top-up**, because `amount_cents` is immutable and the gateway's was sized
for the total minus the gift cards. Creatable: the only create-time validations on
`payment_sessions` are "the order is not free" and "the setting is available", so an order
already carrying a live authorization does not block one.

**The selection stops being single.** If the shopper settles the residual with a second method,
two gateway sessions are live at once, and `findCurrentPaymentSession` returns one — the newest.
The payment step stops being "choose one method" and becomes "here is what is covered, choose how
to cover the rest". Gift cards are already additive, so the model has the shape; this makes
method sessions additive too.

## The risk, and who is accepting it

The failure moves to the side a storefront cannot undo. From
`base_abilities/sales_channel_ability.rb`: a sales-channel token may create a `PaymentRefund`
**only** for `payment_type: 'GIFT_CARD'` on a `pending` order, and there is **no `PaymentVoid`
grant at all**. So a shopper who abandons the top-up leaves a real authorization on their card,
on an unplaced order, and this library cannot reverse it.

Accepted deliberately, on two grounds:

1. **Frequency.** A gateway refusal is common; a gift card failing is rare. A gift card's balance
   is validated when it is applied, so the only realistic failure is someone draining it in the
   minutes before the place. Today's ordering makes the _common_ failure the messy one; this makes
   the _rare_ one messy.
2. **There is a way out that is not a rollback.** The shopper settles the residual — another gift
   card, or a second method — or asks support to cancel the order and reverse the authorization.

Which reframes what today's ordering is really for, and the ADRs it appears in have been amended
to say so: charging the gift cards first is what keeps the library **out of a partially-paid
state it does not implement**. The recoverability argument is true and secondary; the primary one
is that aborting is simple and settling is not.

## Open questions — UI/UX first

The state this creates is not the thank-you page and not the payment step as it stands: money has
been taken, the order is not placed, and something is still owed. It has no design.

- How is what has **already been paid** presented, given it is not a placed order? The recap
  component exists for the thank-you page and assumes the order is done.
- How is the **residual** presented so that it reads as _completing an order_ rather than as
  _paying again_? The shopper has already authenticated a payment.
- What does a shopper who abandons see when they come back — and does the storefront's account
  area list a `pending` order at all? The API allows reading one, but listing it is the consuming
  application's choice, and this recovery path depends on it.
- Does the shopper get told the gift card failed, or only that an amount is outstanding? The
  failed card has already vanished from the list by then.

## Unverified

- **Re-applying the same gift card may succeed rather than fail.** If the balance was only partly
  drained, `applyGiftCard` may create a session for the smaller balance and leave a smaller
  residual. Worth checking before designing around an error message.
- A residual can be very small. `amount_cents` must be `> 0`, and gateways enforce minimum
  amounts, so a sub-euro residual may be unpayable by any method.
