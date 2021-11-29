import PlaceOrderContext from '#context/PlaceOrderContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import placeOrderReducer, {
  placeOrderInitialState,
  PlaceOrderOptions,
  placeOrderPermitted,
} from '#reducers/PlaceOrderReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { setPlaceOrder } from '../reducers/PlaceOrderReducer'

const propTypes = components.PlaceOrderContainer.propTypes
const displayName = components.PlaceOrderContainer.displayName

type PlaceOrderContainerProps = {
  children: ReactNode
  options?: PlaceOrderOptions
}
const PlaceOrderContainer: FunctionComponent<PlaceOrderContainerProps> = (
  props
) => {
  const { children, options } = props
  const [state, dispatch] = useReducer(
    placeOrderReducer,
    placeOrderInitialState
  )
  const { order, setOrderErrors, include, addResourceToInclude } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (!include?.includes('shipments.shipping_method')) {
      addResourceToInclude({
        newResource: 'shipments.shipping_method',
        resourcesIncluded: include,
      })
    }
    if (!include?.includes('billing_address')) {
      addResourceToInclude({
        newResource: 'billing_address',
        resourcesIncluded: include,
      })
    }
    if (!include?.includes('shipping_address')) {
      addResourceToInclude({
        newResource: 'shipping_address',
        resourcesIncluded: include,
      })
    }
    if (order) {
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options: {
          ...options,
        },
      })
    }
  }, [order, include])
  const contextValue = {
    ...state,
    setPlaceOrder: ({
      paymentSource,
    }: {
      paymentSource: Record<string, string>
    }) =>
      setPlaceOrder({ config, order, state, setOrderErrors, paymentSource }),
    placeOrderPermitted: () =>
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options: {
          ...options,
        },
      }),
  }
  return (
    <PlaceOrderContext.Provider value={contextValue}>
      {children}
    </PlaceOrderContext.Provider>
  )
}

PlaceOrderContainer.propTypes = propTypes
PlaceOrderContainer.displayName = displayName

export default PlaceOrderContainer
