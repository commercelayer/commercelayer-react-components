import { type JSX, useContext, useEffect, useReducer } from "react"
import AddressContext from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import ShippingAddressContext from "#context/ShippingAddressContext"
import shippingAddressReducer, {
  setShippingAddress,
  setShippingCustomerAddressId,
  shippingAddressInitialState,
} from "#reducers/ShippingAddressReducer"
import type { DefaultChildrenType } from "#typings/globals"

interface Props {
  children: DefaultChildrenType
}

export function ShippingAddressContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(shippingAddressReducer, shippingAddressInitialState)
  const config = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const { setCloneAddress } = useContext(AddressContext)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional effect with stable context refs
  useEffect(() => {
    if (order && config) {
      setShippingCustomerAddressId({
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
  }, [config, order])
  const contextValue = {
    ...state,
    setShippingAddress: async (id: string, options?: { customerAddressId: string }) => {
      await setShippingAddress(id, {
        config,
        dispatch,
        order,
        customerAddressId: options?.customerAddressId,
      })
      setCloneAddress(id, "shipping_address")
    },
  }
  return (
    <ShippingAddressContext.Provider value={contextValue}>
      {children}
    </ShippingAddressContext.Provider>
  )
}

export default ShippingAddressContainer
