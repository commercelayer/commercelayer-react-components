import { type JSX, type ReactNode, useContext, useEffect, useReducer } from "react"
import AddressContext from "#context/AddressContext"
import BillingAddressContext from "#context/BillingAddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import billingAddressReducer, {
  billingAddressInitialState,
  setBillingAddress,
  setBillingCustomerAddressId,
} from "#reducers/BillingAddressReducer"

interface Props {
  children: ReactNode
}
export function BillingAddressContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(billingAddressReducer, billingAddressInitialState)
  const config = useContext(CommerceLayerContext)
  const { order, include, addResourceToInclude } = useContext(OrderContext)
  const { shipToDifferentAddress, setCloneAddress } = useContext(AddressContext)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional effect with stable context refs
  useEffect(() => {
    if (!include?.includes("billing_address")) {
      addResourceToInclude({
        newResource: "billing_address",
        resourcesIncluded: include,
      })
    }
    if (order && config) {
      setBillingCustomerAddressId({
        dispatch,
        order,
        setCloneAddress,
      })
    }
    return () => {
      dispatch({
        type: "cleanup",
        payload: {},
      })
    }
  }, [order, include])
  const contextValue = {
    ...state,
    setBillingAddress: async (id: string, options?: { customerAddressId: string }) => {
      await setBillingAddress(id, {
        config,
        dispatch,
        order,
        shipToDifferentAddress,
        customerAddressId: options?.customerAddressId,
      })
      setCloneAddress(id, "billing_address")
    },
  }
  return (
    <BillingAddressContext.Provider value={contextValue}>{children}</BillingAddressContext.Provider>
  )
}

export default BillingAddressContainer
