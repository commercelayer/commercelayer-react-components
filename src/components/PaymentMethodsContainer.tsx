import PaymentMethodContext, {
  defaultPaymentMethodContext,
} from '#context/PaymentMethodContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from 'react'
import paymentMethodReducer, {
  paymentMethodInitialState,
  getPaymentMethods,
  PaymentMethodConfig,
  setPaymentMethodConfig,
  PaymentRef,
} from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { BaseError } from '#typings/errors'
import { isEmpty } from 'lodash'
import { setPaymentRef } from '../reducers/PaymentMethodReducer'

const propTypes = components.PaymentMethodsContainer.propTypes
const displayName = components.PaymentMethodsContainer.displayName

type PaymentMethodsContainerProps = {
  children: ReactNode
  config?: PaymentMethodConfig
}
const PaymentMethodsContainer: FunctionComponent<PaymentMethodsContainerProps> =
  (props) => {
    const { children, config } = props
    const [state, dispatch] = useReducer(
      paymentMethodReducer,
      paymentMethodInitialState
    )
    const {
      order,
      getOrder,
      setOrderErrors,
      include,
      addResourceToInclude,
      updateOrder,
    } = useContext(OrderContext)
    const credentials = useContext(CommerceLayerContext)
    useEffect(() => {
      if (!include?.includes('available_payment_methods')) {
        addResourceToInclude({
          newResource: [
            'available_payment_methods',
            'payment_source',
            'payment_method',
          ],
        })
      }

      if (config && isEmpty(state.config))
        setPaymentMethodConfig(config, dispatch)
      if (credentials && order && !state.paymentMethods) {
        getPaymentMethods({ order, dispatch })
      }
      if (credentials && order?.payment_source) {
        dispatch({
          type: 'setPaymentSource',
          payload: { paymentSource: order?.payment_source },
        })
      }
    }, [order, credentials])
    const contextValue = useMemo(() => {
      return {
        ...state,
        setLoading: ({ loading }: { loading: boolean }) =>
          defaultPaymentMethodContext['setLoading']({ loading, dispatch }),
        setPaymentRef: ({ ref }: { ref: PaymentRef }) =>
          setPaymentRef({ ref, dispatch }),
        setPaymentMethodErrors: (errors: BaseError[]) =>
          defaultPaymentMethodContext['setPaymentMethodErrors'](
            errors,
            dispatch
          ),
        setPaymentMethod: async (args: any) =>
          await defaultPaymentMethodContext['setPaymentMethod']({
            ...args,
            config: credentials,
            updateOrder,
            order,
            dispatch,
            setOrderErrors,
          }),
        setPaymentSource: async (args: any) =>
          defaultPaymentMethodContext['setPaymentSource']({
            ...state,
            ...args,
            config: credentials,
            dispatch,
            getOrder,
            updateOrder,
            order,
          }),
        updatePaymentSource: async (args: any) =>
          defaultPaymentMethodContext['updatePaymentSource']({
            ...args,
            config: credentials,
            dispatch,
          }),
        destroyPaymentSource: async (args: any) =>
          defaultPaymentMethodContext['destroyPaymentSource']({
            ...args,
            dispatch,
            config: credentials,
          }),
      }
    }, [state])
    return (
      <PaymentMethodContext.Provider value={contextValue}>
        {children}
      </PaymentMethodContext.Provider>
    )
  }

PaymentMethodsContainer.propTypes = propTypes
PaymentMethodsContainer.displayName = displayName

export default PaymentMethodsContainer
