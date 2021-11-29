import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import customerReducer, {
  customerInitialState,
  getCustomerAddresses,
  getCustomerPaymentSources,
} from '#reducers/CustomerReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { saveCustomerUser } from '#reducers/CustomerReducer'
import CustomerContext from '#context/CustomerContext'
import { defaultCustomerContext } from '#context/CustomerContext'
import { BaseError } from '#typings/errors'
import { isEmpty } from 'lodash'

const propTypes = components.CustomerContainer.propTypes
const displayName = components.CustomerContainer.displayName

export type CustomerContainer = {
  children: ReactNode
  isGuest?: boolean
}
const CustomerContainer: FunctionComponent<CustomerContainer> = (props) => {
  const { children, isGuest = false } = props
  const [state, dispatch] = useReducer(customerReducer, customerInitialState)
  const { order, addResourceToInclude, include, updateOrder } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (
      !include?.includes('available_customer_payment_sources.payment_source') &&
      !isGuest
    ) {
      addResourceToInclude({
        newResource: 'available_customer_payment_sources.payment_source',
        resourcesIncluded: include,
      })
    }
    if (config.accessToken && isEmpty(state.addresses) && !isGuest) {
      getCustomerAddresses({ config, dispatch })
    }
    if (
      order &&
      include?.includes('available_customer_payment_sources.payment_source') &&
      !isGuest
    ) {
      getCustomerPaymentSources({ dispatch, order })
    }
    return () => {
      dispatch({ type: 'setCustomerEmail', payload: {} })
    }
  }, [config.accessToken, order, isGuest, include])
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
