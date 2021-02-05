import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
} from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import components from '#config/components'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import _ from 'lodash'

const propTypes = components.ShippingMethod.propTypes
const displayName = components.ShippingMethod.displayName

type ShippingMethodProps = {
  children: ReactNode
  id?: string
  emptyText?: string
}

const ShippingMethod: FunctionComponent<ShippingMethodProps> = (props) => {
  const {
    children,
    id,
    emptyText = `There are not any shipping method available`,
  } = props
  const { shippingMethods, currentShippingMethodId } = useContext(
    ShipmentChildrenContext
  )
  const components =
    (!_.isEmpty(shippingMethods) &&
      shippingMethods &&
      shippingMethods
        .filter((s) => {
          if (id) {
            return s.id === id
          }
          return true
        })
        .map((shippingMethod, k) => {
          // NOTE: Remove with new SDK version
          // @ts-ignore
          const deliveryLeadTimeForShipment = shippingMethod.deliveryLeadTimeForShipment()
          const shippingProps = {
            shippingMethod,
            currentShippingMethodId,
            deliveryLeadTimeForShipment,
          }
          return (
            <ShippingMethodChildrenContext.Provider
              key={k}
              value={shippingProps}
            >
              {children}
            </ShippingMethodChildrenContext.Provider>
          )
        })) ||
    emptyText
  return <Fragment>{components}</Fragment>
}

ShippingMethod.propTypes = propTypes
ShippingMethod.displayName = displayName

export default ShippingMethod
