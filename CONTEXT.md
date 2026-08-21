# React Components — Payment

This context covers the React components and state that let a storefront select a payment method and attach a payment source to an order during checkout.

## Language

**Payment Method**:
A selectable payment option on an order (a configured gateway option, e.g. "Stripe"). Backed by the `payment_method` resource.
_Avoid_: gateway (as a synonym), payment type

**Payment Source**:
The concrete payment instrument record attached to a single order (e.g. `stripe_payment`, `adyen_payment`, `wire_transfer`). Created per order from the selected Payment Method.
_Avoid_: payment, card, token

**Customer Payment Source**:
A Payment Source saved to a Customer for reuse across orders (a stored card). Selected via the order's `_customer_payment_source_id`.
_Avoid_: saved card (informal), wallet

**Payment Gateway**:
In this codebase, the React component that wires a specific gateway's UI/SDK and drives Payment Source creation for that gateway (e.g. `StripeGateway`, `AdyenGateway`).
_Avoid_: using "gateway" to mean the Payment Method

## Relationships

- An **Order** has at most one **Payment Method** and one **Payment Source**
- A **Payment Source** is created from the selected **Payment Method**
- A **Customer Payment Source** belongs to a **Customer**; selecting one sets the **Order**'s Payment Source

## Example dialogue

> **Dev:** "When the shopper picks Stripe, do we create the **Payment Source** in the `StripePayment` component?"
> **Domain expert:** "No — Stripe has no dedicated creation component. The `StripeGateway`/`PaymentGateway` effect creates the **Payment Source** once the **Payment Method** is selected. Adyen and Braintree, by contrast, create it inside their own components."

## Flagged ambiguities

- "set payment source" was used to mean both the async operation that creates/attaches a Payment Source *and* the reducer action that stores it in state — resolved: the operation is `setPaymentSource(...)`, the reducer action is `dispatch({ type: "setPaymentSource" })`.
