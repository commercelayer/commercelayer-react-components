import ShipmentContext, {
  defaultShipmentContext,
} from '#context/ShipmentContext'
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import shipmentReducer, {
  shipmentInitialState,
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
const ShipmentsContainer: FunctionComponent<ShipmentsContainerProps> = (
  props
) => {
  const { children } = props
  const [state, dispatch] = useReducer(shipmentReducer, shipmentInitialState)
  const { order, getOrder, include, addResourceToInclude } =
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
        resourcesIncluded: include,
      })
    }
    // TODO: Get shipments
    if (order && !isEmpty(config)) {
      getShipments({ order, dispatch, config })
    }
  }, [order, include])
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
