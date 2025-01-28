import ShipmentContext, {
  defaultShipmentContext
} from '#context/ShipmentContext'
import { type ReactNode, useContext, useEffect, useMemo, useReducer, type JSX } from 'react';
import shipmentReducer, {
  shipmentInitialState,
  setShipmentErrors,
  getShipments,
  setShippingMethod
} from '#reducers/ShipmentReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import type { BaseError } from '#typings/errors'
import isEmpty from 'lodash/isEmpty'

interface Props {
  children: ReactNode
}
export function ShipmentsContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(shipmentReducer, shipmentInitialState)
  const { order, getOrder, include, addResourceToInclude, includeLoaded } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (!include?.includes('shipments.available_shipping_methods')) {
      addResourceToInclude({
        newResource: [
          'shipments.available_shipping_methods',
          'shipments.stock_line_items.line_item',
          'shipments.shipping_method',
          'shipments.stock_transfers.line_item',
          'shipments.stock_location',
          'shipments.parcels.parcel_line_items'
        ]
      })
    } else if (!includeLoaded?.['shipments.available_shipping_methods']) {
      addResourceToInclude({
        newResourceLoaded: {
          'shipments.available_shipping_methods': true,
          'shipments.stock_line_items.line_item': true,
          'shipments.shipping_method': true,
          'shipments.stock_transfers.line_item': true,
          'shipments.stock_location': true,
          'shipments.parcels.parcel_line_items': true
        }
      })
    }
  }, [include?.length, includeLoaded != null])
  useEffect(() => {
    if (order != null && !isEmpty(config) && order.shipments) {
      getShipments({ order, dispatch, config })
    }
  }, [order?.shipments])
  useEffect(() => {
    if (order) {
      if (order.shipments && order.shipments.length > 0) {
        const hasShippingMethods = order.shipments.map((shipment) => {
          return (
            shipment.available_shipping_methods &&
            shipment.available_shipping_methods.length > 0
          )
        })
        if (hasShippingMethods.includes(false)) {
          setShipmentErrors(
            [
              ...(state.errors || []),
              {
                code: 'NO_SHIPPING_METHODS',
                message: 'No shipping methods',
                resource: 'shipments'
              }
            ],
            dispatch
          )
        }
      }
      if (order.line_items && order.line_items.length > 0) {
        const hasStocks = order.line_items
          .filter(({ item_type: itemType }) => itemType === 'skus')
          .map((lineItem) => {
            const conditions =
              // @ts-expect-error no type
              lineItem.item?.do_not_ship ||
              // @ts-expect-error no type
              lineItem.item?.do_not_track ||
              // @ts-expect-error no type
              lineItem.item?.inventory?.quantity >= lineItem?.quantity
            return !!conditions
          })
        if (hasStocks.includes(false)) {
          setShipmentErrors(
            [
              ...(state.errors || []),
              {
                code: 'OUT_OF_STOCK',
                message: 'No stock available',
                resource: 'line_items'
              }
            ],
            dispatch
          )
        }
      }
    }
    return () => {
      setShipmentErrors([], dispatch)
    }
  }, [order?.shipments])
  const contextValue = useMemo(() => {
    return {
      ...state,
      setShipmentErrors: (errors: BaseError[]) => {
        defaultShipmentContext.setShipmentErrors(errors, dispatch)
      },
      setShippingMethod: async (shipmentId: string, shippingMethodId: string) =>
        await setShippingMethod({
          shippingMethodId,
          shipmentId,
          config,
          getOrder,
          order
        })
    }
  }, [state])
  return (
    <ShipmentContext.Provider value={contextValue}>
      {children}
    </ShipmentContext.Provider>
  )
}

export default ShipmentsContainer
