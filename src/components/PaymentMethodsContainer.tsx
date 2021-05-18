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
  PaymentMethodConfig,
  setPaymentMethodConfig,
} from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { BaseError } from '#typings/errors'
import { isEmpty } from 'lodash'

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
    if (config && isEmpty(state.config))
      setPaymentMethodConfig(config, dispatch)
    if (credentials && order) {
      getPaymentMethods({ order, dispatch, config: credentials, state })
    }
  }, [order, credentials])
  const contextValue = {
    ...state,
    setPaymentMethodErrors: (errors: BaseError[]) =>
      defaultPaymentMethodContext['setPaymentMethodErrors'](errors, dispatch),
    setPaymentMethod: async (args: any) =>
      await defaultPaymentMethodContext['setPaymentMethod']({
        ...args,
        config: credentials,
        getOrder,
        order,
        dispatch,
      }),
    setPaymentSource: async (args: any) =>
      defaultPaymentMethodContext['setPaymentSource']({
        ...args,
        config: credentials,
        dispatch,
        getOrder,
        order,
      }),
    destroyPaymentSource: async (args: any) =>
      defaultPaymentMethodContext['destroyPaymentSource']({
        ...args,
        dispatch,
        config: credentials,
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
