import BillingAddressContext, {
  defaultBillingAddressContext,
} from '@context/BillingAddressContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useReducer,
} from 'react'
import billingAddressReducer, {
  billingAddressInitialState,
} from '@reducers/BillingAddressReducer'
import CommerceLayerContext from '@context/CommerceLayerContext'
import components from '@config/components'
import OrderContext from '@context/OrderContext'
import AddressContext from '@context/AddressContext'

const propTypes = components.BillingAddressContainer.propTypes

type Props = {
  children: ReactNode
}
const BillingAddressContainer: FunctionComponent<Props> = (props) => {
  const { children } = props
  const [state, dispatch] = useReducer(
    billingAddressReducer,
    billingAddressInitialState
  )
  const config = useContext(CommerceLayerContext)
  const { order, getOrder } = useContext(OrderContext)
  const { shipToDifferentAddress, setCloneAddress } = useContext(AddressContext)
  const contextValue = {
    ...state,
    setBillingAddress: async (id: string) => {
      await defaultBillingAddressContext['setBillingAddress'](id, {
        config,
        dispatch,
        order,
        getOrder,
        shipToDifferentAddress,
      })
      setCloneAddress(id, 'billingAddress')
    },
  }
  return (
    <BillingAddressContext.Provider value={contextValue}>
      {children}
    </BillingAddressContext.Provider>
  )
}

BillingAddressContainer.propTypes = propTypes

export default BillingAddressContainer
