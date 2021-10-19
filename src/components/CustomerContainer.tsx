import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from 'react'
import customerReducer, {
  customerInitialState,
  getCustomerAddresses,
  getCustomerOrders,
  getCustomerPaymentSources,
} from '#reducers/CustomerReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { saveCustomerUser } from '#reducers/CustomerReducer'
import CustomerContext from '#context/CustomerContext'
import { defaultCustomerContext } from '#context/CustomerContext'
import { BaseError } from '#typings/errors'

const propTypes = components.CustomerContainer.propTypes
const displayName = components.CustomerContainer.displayName

export type CustomerContainer = {
  children: ReactNode
  isGuest?: boolean
}
const CustomerContainer: FunctionComponent<CustomerContainer> = (props) => {
  const { children, isGuest = false } = props
  const [state, dispatch] = useReducer(customerReducer, customerInitialState)
  const { order, addResourceToInclude, include, updateOrder, includeLoaded } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (
      !include?.includes('available_customer_payment_sources.payment_source') &&
      !isGuest
    ) {
      addResourceToInclude({
        newResource: 'available_customer_payment_sources.payment_source',
      })
    } else if (
      !includeLoaded?.['available_customer_payment_sources.payment_source'] &&
      !isGuest
    ) {
      addResourceToInclude({
        newResourceLoaded: {
          'available_customer_payment_sources.payment_source': true,
        },
      })
    }
  }, [include, includeLoaded])

  useEffect(() => {
    if (
      config.accessToken &&
      order &&
      state.addresses?.length === 0 &&
      !isGuest
    ) {
      getCustomerAddresses({ config, dispatch })
    }
    if (order?.available_customer_payment_sources && !isGuest) {
      getCustomerPaymentSources({ dispatch, order })
    }
  }, [config.accessToken, order, isGuest])
  const contextValue = {
    isGuest,
    ...state,
    saveCustomerUser: async (customerEmail: string) => {
      await saveCustomerUser({
        config,
        customerEmail,
        dispatch,
        updateOrder,
        order,
      })
    },
    setCustomerErrors: (errors: BaseError[]) =>
      defaultCustomerContext['setCustomerErrors'](errors, dispatch),
    setCustomerEmail: (customerEmail: string) =>
      defaultCustomerContext['setCustomerEmail'](customerEmail, dispatch),
    getCustomerPaymentSources: () =>
      getCustomerPaymentSources({ dispatch, order }),
  }
  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}

CustomerContainer.propTypes = propTypes
CustomerContainer.displayName = displayName

export default CustomerContainer
