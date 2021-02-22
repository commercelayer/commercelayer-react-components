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
  const { order, getOrder } = useContext(OrderContext)
  const { setCloneAddress } = useContext(AddressContext)
  useEffect(() => {
    if (order) {
      setShippingCustomerAddressId({
        dispatch,
        order,
        setCloneAddress,
      })
    }
  }, [order])
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
        getOrder,
        customerAddressId: options?.customerAddressId,
      })
      setCloneAddress(id, 'shippingAddress')
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
