import { useContext } from "react"
import PlaceOrderContext from "#context/PlaceOrderContext"
import { usePlaceOrder } from "#hooks/usePlaceOrder"
import type { PlaceOrderOptions } from "#reducers/PlaceOrderReducer"

/**
 * The place-order state a component should read, whichever way the tree is built.
 *
 * With `<PlaceOrderContainer>` above, that is the context it provides. Without
 * it, the context reaching a component outside the button is the empty default
 * — `status` frozen at `"standby"`, no `setPlaceOrder`, no button ref — so the
 * state comes from the shared store instead. That is what lets the payment
 * components work when they are siblings of the place-order step rather than
 * its descendants.
 *
 * Only the button passes `isOwner`; everyone else reads and dispatches without
 * taking over the container's work.
 */
export function usePlaceOrderStateContext({
  options,
  isOwner = false,
}: {
  options?: PlaceOrderOptions
  isOwner?: boolean
} = {}) {
  const parentContext = useContext(PlaceOrderContext)
  const isStandalone = parentContext._isProvided !== true
  const standalone = usePlaceOrder({ isStandalone, options, isOwner })

  return {
    isStandalone,
    placeOrderContext: isStandalone ? standalone : parentContext,
  }
}
