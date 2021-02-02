import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
} from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import components from '#config/components'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'

const propTypes = components.ShippingMethod.propTypes
const displayName = components.ShippingMethod.displayName

type ShippingMethodProps = {
  children: ReactNode
}

const ShippingMethod: FunctionComponent<ShippingMethodProps> = (props) => {
  const { children } = props
  const { shippingMethods, currentShippingMethodId } = useContext(
    ShipmentChildrenContext
  )
  const components =
    shippingMethods &&
    shippingMethods.map((shippingMethod, k) => {
      // NOTE: Remove with new SDK version
      // @ts-ignore
      const deliveryLeadTimeForShipment = shippingMethod.deliveryLeadTimeForShipment()
      const shippingProps = {
        shippingMethod,
        currentShippingMethodId,
        deliveryLeadTimeForShipment,
      }
      return (
        <ShippingMethodChildrenContext.Provider key={k} value={shippingProps}>
          {children}
        </ShippingMethodChildrenContext.Provider>
      )
    })
  return <Fragment>{components}</Fragment>
}

ShippingMethod.propTypes = propTypes
ShippingMethod.displayName = displayName

export default ShippingMethod
