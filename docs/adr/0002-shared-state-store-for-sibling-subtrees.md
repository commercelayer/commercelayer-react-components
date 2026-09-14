# Share checkout state through a module-level store, not a provider

## Context

v5 deprecates the container components in favour of standalone ones, and the standalone components provide their context **to their own children only**. That works when every consumer is a descendant. It does not work when a consumer lives in a **sibling** subtree, which is the normal shape of a stepped checkout:

- `SaveAddressesButton` saves both address forms, so it cannot be inside either one.
- `PlaceOrderButton` sits in its own step, outside the payment step, yet six payment components read `PlaceOrderContext` and the button reads `PaymentMethodContext`.
- In the address book, `BillingAddress`, `ShippingAddress` and `Address` sit outside the forms as well.

Dropping the container left every one of those on the default context. `AddressesContainer` was the worst case, because it failed silently: `SaveAddressesButton` reads `saveAddresses` from the context, standalone mode is *defined* as `saveAddresses == null`, and none of the cases in `handleClick` matched. No error, no warning, no save. That is issue #841.

## Decision

The state moves out of React and into module-level stores built on `createSharedStateStore` (`core-components`), keyed by access token and order id and read with `useSyncExternalStore`. Components converge on one state wherever they sit in the tree, and the existing `*Context` providers stay as the internal transport towards each component's own children.

The public API stays the hooks. `useAddressForm` in `react-hooks-components` holds the address state; the place-order state is internal to `react-components`, because its reducer depends on nine utilities that live there and no application code needs to reach it.

## Considered options

- **Export a provider per context**, as the issue itself suggests. Rejected: it re-creates the wrapper we are deleting, and it makes the context object part of the public contract right before v6 wants to redesign it.
- **Inject state through props** on the standalone components. Rejected: no prop-drilling path exists today — `onClick` and `onChange` are post-success notifications, not overrides — so it means a new prop on roughly nine components, each with two sources for the same state and a precedence rule to document.
- **A bespoke store per family**, on the model of `termsAcceptanceStore`. Rejected in favour of one factory; that store stays as it is because a single boolean does not need the machinery.
- **Hoisting the state into `<Order>`**, which is a mandatory ancestor. Workable, but it grows a component every consumer already mounts, and it does not help the address book, where there is no order at all.

## Consequences

Entries are keyed by access token and order id and are **not** dropped when their last subscriber unmounts: a stepped checkout unmounts whole subtrees between steps, and half-typed address values must survive the round trip. Without an order id the key falls back to the access token alone, which is what the customer address book needs — a form and its save button are siblings there too.

State that an application owns rather than the library must be published by the application. `shipToDifferentAddress` is the case in point: the container used to hold it, and once it is gone the only components that could publish it are the address forms, which a UI library may legitimately unmount. `mfe-checkout` publishes it from the step that owns it, through `useAddressForm().setFlags()`.

Two invariants the stores depend on: snapshots are frozen and compared by identity, so a write that changes nothing must return the previous snapshot or `useSyncExternalStore` will loop; and freezing is shallow, which is why a DOM ref — the place-order button's — can live in a snapshot and still be mutated.

The deprecated containers are untouched. When one is mounted it still owns the state and the standalone path stays inert, so nothing changes for a consumer who has not migrated.
