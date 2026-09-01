# Presentation state belongs to the consuming application

**Date:** 2026-09-01
**Status:** accepted
**Scope:** the `payment_settings` components on the `payment_sessions` model

## Context

The first cut of `<PaymentSettingGiftCard>` held a piece of UI state: `inputRequested`,
from which it derived `isInputVisible = giftCardSessions.length === 0 || inputRequested`.
The input, the submit button and a `<PaymentSettingGiftCardAddButton>` were all gated on
it, and applying a card set it back to false so the field folded away on its own.

Designing the checkout against these components exposed the cost. mfe-checkout wants the
whole gift card section behind a "use a gift card" switch, opening and closing on the
shopper's click. Two pieces of state then decide whether one input is on screen — the
application's switch and the library's flag — and the library's wins: mounting the input
while `isInputVisible` is false renders nothing, for no reason the application can see.

The same gap showed up one component up. `<PaymentSetting>` exposed the selection only
through `<PaymentSettingRadioButton>`'s render prop, so an application could style the
control but not the card around it, and could not make the whole card the click target.

None of these components have shipped yet, so there is no compatibility to weigh.

## Decision

**The library owns domain rules; the application owns presentation.**

Concretely, on the gift card side:

- `isInputVisible` and `showInput` are gone from the context, along with
  `<PaymentSettingGiftCardAddButton>` — a component whose only job was to flip that flag.
  "Add another one" is now ordinary markup in the application.
- `<PaymentSettingGiftCardInput>` and `<PaymentSettingGiftCardSubmitButton>` render
  whenever the **domain** allows it: not readonly, and `canAddGiftCard`. That rule stays
  here because applying a card that is not needed fails with a 422 about `amount_cents`
  that no shopper can act on.
- `<PaymentSettingGiftCard>` accepts a function child receiving the gift card state
  (`giftCardSessions`, `canAddGiftCard`, `isCovered`, `remainingAmountCents`,
  `giftCardAmountCents`, `isApplying`, `errors`, `readonly`). An application drives its own
  disclosure off those — opening the section when a card is already applied, folding the
  field away when the applied count goes up.

And on the setting side:

- `<PaymentSetting>` accepts a function child receiving `{ setting, isSelected, isPending,
  currentPaymentSession, errors, selectSetting }`, so the chosen option can be styled as a
  card and the whole card can select it.
- `selectSetting` is guarded by a **ref**, not by `pendingSettingId`. A single click on a
  card wrapping the radio reaches the handler twice, and both reads of the state variable
  still say "idle" — which would leave two Payment Sessions behind for one click.

The state components keep their own conditions, because those are domain rules too:
`<PaymentSettingGiftCardList>` stays visible in readonly and when the order is covered,
and a charged card still renders no remove control.

## Consequences

**The field no longer folds away by itself after an apply.** An application that wants
that behaviour watches `giftCardSessions.length` through the function child. mfe-checkout
does exactly that, in `CheckoutPaymentSessions.tsx`.

**One less component to document and version.** The add button was pure disclosure.

**Function children are now the single way to read a subtree's state.** Both new render
props follow the shape already used across the library rather than introducing a hook, so
there is one idiom, not two.

**Nothing prevents an application from rendering a control the domain would refuse** — it
can render its own button and call nothing. The components that actually talk to the API
still refuse, so the failure mode is a dead control, not a bad request.
