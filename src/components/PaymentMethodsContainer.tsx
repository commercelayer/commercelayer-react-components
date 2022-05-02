import PaymentMethodContext, {
  defaultPaymentMethodContext,
} from '#context/PaymentMethodContext'
import React, {
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
  setPaymentSource,
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
const PaymentMethodsContainer: React.FunctionComponent<
  PaymentMethodsContainerProps
> = (props) => {
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
    includeLoaded,
  } = useContext(OrderContext)
  const credentials = useContext(CommerceLayerContext)
  async function getPayMethods() {
    order && (await getPaymentMethods({ order, dispatch }))
  }
  useEffect(() => {
    if (!include?.includes('available_payment_methods')) {
      addResourceToInclude({
        newResource: [
          'available_payment_methods',
          'payment_source',
          'payment_method',
          'line_items.line_item_options.sku_option',
          'line_items.item',
        ],
      })
    } else if (!includeLoaded?.['available_payment_methods']) {
      addResourceToInclude({
        newResourceLoaded: {
          available_payment_methods: true,
          payment_source: true,
          payment_method: true,
          'line_items.line_item_options.sku_option': true,
          'line_items.item': true,
        },
      })
    }
    if (config && isEmpty(state.config))
      setPaymentMethodConfig(config, dispatch)
    if (credentials && order) {
      if (!state.paymentMethods) {
        getPayMethods()
      }
    }
    if (order?.payment_source) {
      dispatch({
        type: 'setPaymentSource',
        payload: {
          paymentSource: order?.payment_source,
        },
      })
    }
    if (order?.payment_source === null) {
      dispatch({
        type: 'setPaymentSource',
        payload: {
          paymentSource: undefined,
        },
      })
    }
  }, [order, credentials, include, includeLoaded])
  const contextValue = useMemo(() => {
    return {
      ...state,
      setLoading: ({ loading }: { loading: boolean }) =>
        defaultPaymentMethodContext['setLoading']({ loading, dispatch }),
      setPaymentRef: ({ ref }: { ref: PaymentRef }) =>
        setPaymentRef({ ref, dispatch }),
      setPaymentMethodErrors: (errors: BaseError[]) =>
        defaultPaymentMethodContext['setPaymentMethodErrors'](errors, dispatch),
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
        await defaultPaymentMethodContext['setPaymentSource']({
          ...state,
          ...args,
          config: credentials,
          dispatch,
          getOrder,
          updateOrder,
          order,
        }),
      updatePaymentSource: async (args: any) =>
        await defaultPaymentMethodContext['updatePaymentSource']({
          ...args,
          config: credentials,
          dispatch,
        }),
      destroyPaymentSource: async (args: any) =>
        await defaultPaymentMethodContext['destroyPaymentSource']({
          ...args,
          dispatch,
          config: credentials,
          updateOrder,
          orderId: order?.id,
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
