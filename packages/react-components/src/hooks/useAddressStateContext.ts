import { useContext } from "react"
import AddressContext from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { useStandaloneAddress } from "#hooks/useStandaloneAddress"

/**
 * The address state a component should read, whichever way the tree is built.
 *
 * With `<AddressesContainer>` above, that is the context it provides. Without
 * it, the context reaching a component outside the forms is the empty default,
 * so the state comes from the shared store instead — which is what lets
 * components that are siblings of the forms, rather than their descendants,
 * see what was typed into them and what was selected.
 *
 * Components that only read pass no flags, so they never overwrite what the
 * forms published.
 */
export function useAddressStateContext() {
  const parentAddressContext = useContext(AddressContext)
  const isStandalone = parentAddressContext.saveAddresses == null
  const config = useContext(CommerceLayerContext)
  const { order, orderId, updateOrder } = useContext(OrderContext)

  const standalone = useStandaloneAddress({
    isStandalone,
    config,
    order,
    orderId,
    updateOrder,
  })

  return {
    isStandalone,
    addressContext: isStandalone ? standalone.standaloneContextValue : parentAddressContext,
    validateAddresses: standalone.validateAddresses,
  }
}
