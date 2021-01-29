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
} from '#reducers/CustomerReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { saveCustomerUser } from '#reducers/CustomerReducer'
import { getOrderContext } from '#reducers/OrderReducer'
import CustomerContext from '#context/CustomerContext'
import { defaultCustomerContext } from '#context/CustomerContext'
import { BaseError } from '#typings/errors'
import _ from 'lodash'

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
    if (config.accessToken && _.isEmpty(state.addresses) && !isGuest) {
      getCustomerAddresses({ config, dispatch })
    }
  }, [config.accessToken])
  const contextValue = {
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
