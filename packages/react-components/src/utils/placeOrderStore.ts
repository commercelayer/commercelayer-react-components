import { createSharedStateStore } from "@commercelayer/core-components"
import { placeOrderInitialState, type PlaceOrderState } from "#reducers/PlaceOrderReducer"

/**
 * Place-order state shared, per order, by every component that takes part in
 * placing it.
 *
 * `<PlaceOrderButton>` is not an ancestor of the payment components — in a
 * stepped checkout it is a sibling of the whole payment step — yet the two
 * sides have to agree: the button needs the selected payment source, and the
 * gateways need the place-order status and the button's ref to drive it. The
 * deprecated `<PlaceOrderContainer>` used to sit above both; without it there
 * is no common ancestor, so the state lives here instead.
 *
 * The button ref is kept here too. Freezing a snapshot is shallow, so the ref
 * object inside it stays mutable and keeps its identity — which is all
 * `useSyncExternalStore` and the gateways need.
 */
export const placeOrderStore = createSharedStateStore<PlaceOrderState>(placeOrderInitialState)
