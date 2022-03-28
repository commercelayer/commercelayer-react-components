import ShipmentContext, {
  defaultShipmentContext,
} from '#context/ShipmentContext'
import React, { ReactNode, useContext, useEffect, useReducer } from 'react'
import shipmentReducer, {
  shipmentInitialState,
  setShipmentErrors,
  getShipments,
  setShippingMethod,
} from '#reducers/ShipmentReducer'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import components from '#config/components'
import { BaseError } from '#typings/errors'
import { isEmpty } from 'lodash'

const propTypes = components.ShipmentsContainer.propTypes
const displayName = components.ShipmentsContainer.displayName

type ShipmentsContainerProps = {
  children: ReactNode
}
const ShipmentsContainer: React.FunctionComponent<ShipmentsContainerProps> = (
  props
) => {
  const { children, ...p } = props
  const [state, dispatch] = useReducer(shipmentReducer, shipmentInitialState)
  const { order, getOrder, include, addResourceToInclude, includeLoaded } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (!include?.includes('shipments.available_shipping_methods')) {
      addResourceToInclude({
        newResource: [
          'shipments.available_shipping_methods',
          'shipments.shipment_line_items.line_item',
          'shipments.shipping_method',
          'shipments.stock_transfers',
          'shipments.stock_location',
        ],
      })
    } else if (!includeLoaded?.['shipments.available_shipping_methods']) {
      addResourceToInclude({
        newResourceLoaded: {
          'shipments.available_shipping_methods': true,
          'shipments.shipment_line_items.line_item': true,
          'shipments.shipping_method': true,
          'shipments.stock_transfers': true,
          'shipments.stock_location': true,
        },
      })
    }
    if (!include?.includes('line_items.item')) {
      addResourceToInclude({
        newResource: ['line_items.item'],
      })
    } else if (!includeLoaded?.['line_items.item']) {
      addResourceToInclude({
        newResourceLoaded: {
          'line_items.item': true,
        },
      })
    }
    if (order && !isEmpty(config) && order.shipments) {
      getShipments({ order, dispatch, config })
    }
  }, [order, include, includeLoaded])
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
                resource: 'shipments',
              },
            ],
            dispatch
          )
        }
      }
      if (order.line_items && order.line_items.length > 0) {
        const hasStocks = order.line_items.map((line_item) => {
          // @ts-ignore
          return !(line_item.item?.inventory?.quantity >= line_item?.quantity)
            ? false
            : // @ts-ignore
              line_item.item?.do_not_ship ||
                // @ts-ignore
                line_item.item?.inventory?.available
        })
        if (hasStocks.includes(false)) {
          setShipmentErrors(
            [
              ...(state.errors || []),
              {
                code: 'OUT_OF_STOCK',
                message: 'No stock available',
                resource: 'line_items',
              },
            ],
            dispatch
          )
        }
      }
    }
    return () => {
      setShipmentErrors([], dispatch)
    }
  }, [order])
  const contextValue = {
    ...state,
    setShipmentErrors: (errors: BaseError[]) =>
      defaultShipmentContext['setShipmentErrors'](errors, dispatch),
    setShippingMethod: async (shipmentId: string, shippingMethodId: string) =>
      await setShippingMethod({
        shippingMethodId,
        shipmentId,
        config,
        getOrder,
        order,
      }),
  }

  return (
    <ShipmentContext.Provider value={contextValue}>
      {children}
    </ShipmentContext.Provider>
  )
}

ShipmentsContainer.propTypes = propTypes
ShipmentsContainer.displayName = displayName

export default ShipmentsContainer
