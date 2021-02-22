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
  // setShippingMethod,
} from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { BaseError } from '#typings/errors'

const propTypes = components.PaymentMethodsContainer.propTypes
const displayName = components.PaymentMethodsContainer.displayName

type PaymentMethodsContainerProps = {
  children: ReactNode
}
const PaymentMethodsContainer: FunctionComponent<PaymentMethodsContainerProps> = (
  props
) => {
  const { children } = props
  const [state, dispatch] = useReducer(
    paymentMethodReducer,
    paymentMethodInitialState
  )
  const { order } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (order) {
      getPaymentMethods({ order, dispatch, config })
    }
  }, [order])
  const contextValue = {
    ...state,
    setPaymentMethodErrors: (errors: BaseError[]) =>
      defaultPaymentMethodContext['setPaymentMethodErrors'](errors, dispatch),
    // setShippingMethod: async (shipmentId: string, shippingMethodId: string) =>
    //   await setShippingMethod({
    //     shippingMethodId,
    //     shipmentId,
    //     config,
    //     getOrder,
    //     order,
    //   }),
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
