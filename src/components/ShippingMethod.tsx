import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import components from '#config/components'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import _ from 'lodash'

const propTypes = components.ShippingMethod.propTypes
const displayName = components.ShippingMethod.displayName

type ShippingMethodProps = {
  children: ReactNode
  id?: string[]
  readonly?: boolean
  emptyText?: string
}

const ShippingMethod: FunctionComponent<ShippingMethodProps> = (props) => {
  const {
    children,
    id,
    readonly,
    emptyText = `There are not any shipping method available`,
  } = props
  const { shippingMethods, currentShippingMethodId } = useContext(
    ShipmentChildrenContext
  )
  const [items, setItems] = useState<JSX.Element[]>([])
  useEffect(() => {
    const methods =
      shippingMethods &&
      shippingMethods
        .filter((s) => {
          if (readonly) return s.id === currentShippingMethodId
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
        })
    if (methods) setItems(methods)
  }, [currentShippingMethodId])
  const components = (!_.isEmpty(items) && items) || emptyText
  return <Fragment>{components}</Fragment>
}

ShippingMethod.propTypes = propTypes
ShippingMethod.displayName = displayName

export default ShippingMethod
