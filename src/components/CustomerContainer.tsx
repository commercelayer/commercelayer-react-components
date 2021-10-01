import React, {
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
import { getOrderContext } from '#reducers/OrderReducer'
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
  const { order, getOrder } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (config.accessToken) {
      if (isEmpty(state.addresses) && !isGuest) {
        getCustomerAddresses({ config, dispatch })
      }
      if (order && isEmpty(state.payments) && !isGuest) {
        getCustomerPaymentSources({ config, dispatch, order })
      }
      if (isEmpty(order) && isEmpty(state.orders)) {
        getCustomerOrders({ config, dispatch })
      }
    }

    return () => {
      dispatch({ type: 'setCustomerEmail', payload: {} })
    }
  }, [config.accessToken, order, isGuest])
  const contextValue = useMemo(
    () => ({
      isGuest,
      ...state,
      saveCustomerUser: async (customerEmail: string) => {
        await saveCustomerUser({
          config,
          customerEmail,
          dispatch,
          getOrder: getOrder as getOrderContext,
          order,
        })
      },
      setCustomerErrors: (errors: BaseError[]) =>
        defaultCustomerContext['setCustomerErrors'](errors, dispatch),
      setCustomerEmail: (customerEmail: string) =>
        defaultCustomerContext['setCustomerEmail'](customerEmail, dispatch),
      deleteCustomerAddress: ({
        customerAddressId,
      }: {
        customerAddressId: string
      }) =>
        defaultCustomerContext['deleteCustomerAddress']({
          addresses: state?.addresses,
          dispatch,
          config,
          customerAddressId,
        }),
    }),
    [state]
  )
  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}

CustomerContainer.propTypes = propTypes
CustomerContainer.displayName = displayName

export default CustomerContainer
