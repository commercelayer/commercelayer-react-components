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

const propTypes = components.ShipmentsContainer.propTypes
const displayName = components.ShipmentsContainer.displayName

export type ShipmentsContainer = {
  children: ReactNode
}
const ShipmentsContainer: FunctionComponent<ShipmentsContainer> = (props) => {
  const { children } = props
  const [state, dispatch] = useReducer(shipmentReducer, shipmentInitialState)
  const { order } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    // TODO: Get shipments
    if (order) {
      getShipments({ order, dispatch, config })
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
        dispatch,
        config,
        state,
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
