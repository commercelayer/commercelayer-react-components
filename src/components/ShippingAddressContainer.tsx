import ShippingAddressContext from '#context/ShippingAddressContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import shippingAddressReducer, {
  setShippingAddress,
  shippingAddressInitialState,
  setShippingCustomerAddressId,
} from '#reducers/ShippingAddressReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import OrderContext from '#context/OrderContext'
import AddressContext from '#context/AddressContext'

const propTypes = components.ShippingAddressContainer.propTypes

type Props = {
  children: ReactNode
}
const ShippingAddressContainer: FunctionComponent<Props> = (props) => {
  const { children } = props
  const [state, dispatch] = useReducer(
    shippingAddressReducer,
    shippingAddressInitialState
  )
  const config = useContext(CommerceLayerContext)
  const { order, updateOrder } = useContext(OrderContext)
  const { setCloneAddress } = useContext(AddressContext)
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
        type: 'cleanup',
        payload: {},
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
        customerAddressId: options?.customerAddressId,
      })
      setCloneAddress(id, 'shipping_address')
    },
  }
  return (
    <ShippingAddressContext.Provider value={contextValue}>
      {children}
    </ShippingAddressContext.Provider>
  )
}

ShippingAddressContainer.propTypes = propTypes

export default ShippingAddressContainer
