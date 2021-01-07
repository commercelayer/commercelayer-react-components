import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import customerReducer, {
  customerInitialState,
} from '@reducers/CustomerReducer'
import OrderContext from '@context/OrderContext'
import CommerceLayerContext from '@context/CommerceLayerContext'
import components from '@config/components'
import { saveCustomerUser } from '@reducers/CustomerReducer'
import { getOrderContext } from '@reducers/OrderReducer'
import CustomerContext from '@context/CustomerContext'
import { defaultCustomerContext } from '../context/CustomerContext'
import { BaseError } from '@typings/errors'

const propTypes = components.CustomerContainer.propTypes
const displayName = components.CustomerContainer.displayName

export type CustomerContainer = {
  children: ReactNode
  saveOnBlur?: boolean
  onSave?: () => void
}
const CustomerContainer: FunctionComponent<CustomerContainer> = (props) => {
  const { children, onSave, saveOnBlur = false } = props
  const [state, dispatch] = useReducer(customerReducer, customerInitialState)
  const { order, getOrder } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    dispatch({
      type: 'setSaveOnBlur',
      payload: {
        saveOnBlur,
      },
    })
  }, [saveOnBlur])
  const contextValue = {
    ...state,
    saveOnBlur,
    saveCustomerUser: async (customerEmail: string) => {
      await saveCustomerUser({
        config,
        customerEmail,
        dispatch,
        getOrder: getOrder as getOrderContext,
        order,
      })
      if (onSave) onSave()
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
