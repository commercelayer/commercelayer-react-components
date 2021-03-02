import PaymentMethodContext, {
  defaultPaymentMethodContext,
} from '#context/PaymentMethodContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import paymentMethodReducer, {
  paymentMethodInitialState,
  getPaymentMethods,
  setPaymentMethod,
  PaymentMethodConfig,
  setPaymentSource,
} from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { BaseError } from '#typings/errors'
import _ from 'lodash'
import { setPaymentMethodConfig } from '../reducers/PaymentMethodReducer'

const propTypes = components.PaymentMethodsContainer.propTypes
const displayName = components.PaymentMethodsContainer.displayName

type PaymentMethodsContainerProps = {
  children: ReactNode
  config?: PaymentMethodConfig
}
const PaymentMethodsContainer: FunctionComponent<PaymentMethodsContainerProps> = (
  props
) => {
  const { children, config } = props
  const [state, dispatch] = useReducer(
    paymentMethodReducer,
    paymentMethodInitialState
  )
  const { order, getOrder } = useContext(OrderContext)
  const credentials = useContext(CommerceLayerContext)
  useEffect(() => {
    if (config && _.isEmpty(state.config))
      setPaymentMethodConfig(config, dispatch)
    if (order) {
      getPaymentMethods({ order, dispatch, config: credentials, state })
    }
  }, [order])
  const contextValue = {
    ...state,
    setPaymentMethodErrors: (errors: BaseError[]) =>
      defaultPaymentMethodContext['setPaymentMethodErrors'](errors, dispatch),
    setPaymentMethod: async (args: any) =>
      await setPaymentMethod({
        ...args,
        config: credentials,
        getOrder,
        order,
        dispatch,
      }),
    setPaymentSource: async (args: any) =>
      setPaymentSource({
        ...args,
        config: credentials,
        dispatch,
        getOrder,
        order,
      }),
  }
  return (
    <PaymentMethodContext.Provider value={contextValue}>
      {children}
    </PaymentMethodContext.Provider>
  )
}

PaymentMethodsContainer.propTypes = propTypes
PaymentMethodsContainer.displayName = displayName

export default PaymentMethodsContainer
