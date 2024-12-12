import ShippingAddressContext from '#context/ShippingAddressContext'
import { useContext, useEffect, useReducer, type JSX } from 'react';
import shippingAddressReducer, {
  setShippingAddress,
  shippingAddressInitialState,
  setShippingCustomerAddressId
} from '#reducers/ShippingAddressReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext from '#context/OrderContext'
import AddressContext from '#context/AddressContext'
import type { DefaultChildrenType } from '#typings/globals'

interface Props {
  children: DefaultChildrenType
}

export function ShippingAddressContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(
    shippingAddressReducer,
    shippingAddressInitialState
  )
  const config = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const { setCloneAddress } = useContext(AddressContext)
  useEffect(() => {
    if (order && config) {
      setShippingCustomerAddressId({
        dispatch,
        order,
        setCloneAddress
      })
    }
    return () => {
      dispatch({
        type: 'cleanup',
        payload: {}
      })
    }
  }, [config, order])
  const contextValue = {
    ...state,
    setShippingAddress: async (
      id: string,
      options?: { customerAddressId: string }
    ) => {
      await setShippingAddress(id, {
        config,
        dispatch,
        order,
        customerAddressId: options?.customerAddressId
      })
      setCloneAddress(id, 'shipping_address')
    }
  }
  return (
    <ShippingAddressContext.Provider value={contextValue}>
      {children}
    </ShippingAddressContext.Provider>
  )
}

export default ShippingAddressContainer
