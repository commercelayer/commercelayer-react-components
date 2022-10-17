import PlaceOrderContext from '#context/PlaceOrderContext'
import { ReactNode, RefObject, useContext, useEffect, useReducer } from 'react'
import placeOrderReducer, {
  placeOrderInitialState,
  PlaceOrderOptions,
  placeOrderPermitted,
  setButtonRef
} from '#reducers/PlaceOrderReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { setPlaceOrder } from '../../reducers/PlaceOrderReducer'
import { PaymentSourceType } from '#reducers/PaymentMethodReducer'
import useCustomContext from '#utils/hooks/useCustomContext'

interface Props {
  children: ReactNode
  options?: PlaceOrderOptions
}
export function PlaceOrderContainer(props: Props): JSX.Element {
  const { children, options } = props
  const [state, dispatch] = useReducer(
    placeOrderReducer,
    placeOrderInitialState
  )
  const {
    order,
    setOrder,
    setOrderErrors,
    include,
    addResourceToInclude,
    includeLoaded
  } = useCustomContext({
    context: OrderContext,
    contextComponentName: 'OrderContainer',
    currentComponentName: 'PlaceOrderContainer',
    key: 'order'
  })
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (!include?.includes('shipments.available_shipping_methods')) {
      addResourceToInclude({
        newResource: [
          'shipments.available_shipping_methods',
          'shipments.shipment_line_items.line_item',
          'shipments.shipping_method',
          'shipments.stock_transfers.line_item',
          'shipments.stock_location'
        ]
      })
    } else if (!includeLoaded?.['shipments.available_shipping_methods']) {
      addResourceToInclude({
        newResourceLoaded: {
          'shipments.available_shipping_methods': true,
          'shipments.shipment_line_items.line_item': true,
          'shipments.shipping_method': true,
          'shipments.stock_transfers.line_item': true,
          'shipments.stock_location': true
        }
      })
    }
    if (!include?.includes('billing_address')) {
      addResourceToInclude({
        newResource: 'billing_address'
      })
    } else if (!includeLoaded?.billing_address) {
      addResourceToInclude({
        newResourceLoaded: { billing_address: true }
      })
    }
    if (!include?.includes('shipping_address')) {
      addResourceToInclude({
        newResource: 'shipping_address',
        resourcesIncluded: include
      })
    } else if (!includeLoaded?.shipping_address) {
      addResourceToInclude({
        newResourceLoaded: { shipping_address: true }
      })
    }
    if (order) {
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options: {
          ...options
        }
      })
    }
  }, [order, include, includeLoaded])
  const contextValue = {
    ...state,
    setPlaceOrder: async ({
      paymentSource
    }: {
      paymentSource?: PaymentSourceType
    }) =>
      await setPlaceOrder({
        config,
        order,
        state,
        setOrderErrors,
        paymentSource,
        include,
        setOrder
      }),
    placeOrderPermitted: () =>
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options: {
          ...options
        }
      }),
    setButtonRef: (ref: RefObject<HTMLButtonElement>) =>
      setButtonRef(ref, dispatch)
  }
  return (
    <PlaceOrderContext.Provider value={contextValue}>
      {children}
    </PlaceOrderContext.Provider>
  )
}

export default PlaceOrderContainer
