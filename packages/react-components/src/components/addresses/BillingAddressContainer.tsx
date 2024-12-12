import BillingAddressContext from '#context/BillingAddressContext'
import { type ReactNode, useContext, useEffect, useReducer, type JSX } from 'react';
import billingAddressReducer, {
  billingAddressInitialState,
  setBillingAddress,
  setBillingCustomerAddressId
} from '#reducers/BillingAddressReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext from '#context/OrderContext'
import AddressContext from '#context/AddressContext'

interface Props {
  children: ReactNode
}
export function BillingAddressContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(
    billingAddressReducer,
    billingAddressInitialState
  )
  const config = useContext(CommerceLayerContext)
  const { order, include, addResourceToInclude } = useContext(OrderContext)
  const { shipToDifferentAddress, setCloneAddress } = useContext(AddressContext)
  useEffect(() => {
    if (!include?.includes('billing_address')) {
      addResourceToInclude({
        newResource: 'billing_address',
        resourcesIncluded: include
      })
    }
    if (order && config) {
      setBillingCustomerAddressId({
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
  }, [order, include])
  const contextValue = {
    ...state,
    setBillingAddress: async (
      id: string,
      options?: { customerAddressId: string }
    ) => {
      await setBillingAddress(id, {
        config,
        dispatch,
        order,
        shipToDifferentAddress,
        customerAddressId: options?.customerAddressId
      })
      setCloneAddress(id, 'billing_address')
    }
  }
  return (
    <BillingAddressContext.Provider value={contextValue}>
      {children}
    </BillingAddressContext.Provider>
  )
}

export default BillingAddressContainer
