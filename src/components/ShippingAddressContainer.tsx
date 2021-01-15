import ShippingAddressContext, {
  defaultShippingAddressContext,
} from '@context/ShippingAddressContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useReducer,
} from 'react'
import shippingAddressReducer, {
  shippingAddressInitialState,
} from '@reducers/ShippingAddressReducer'
import CommerceLayerContext from '@context/CommerceLayerContext'
import components from '@config/components'
import OrderContext from '@context/OrderContext'
import AddressContext from '@context/AddressContext'

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
  const contextValue = {
    ...state,
    setShippingAddress: async (id: string) => {
      await defaultShippingAddressContext['setShippingAddress'](id, {
        config,
        dispatch,
        order,
        getOrder,
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
