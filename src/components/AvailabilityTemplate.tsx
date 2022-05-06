import { useContext, FunctionComponent } from 'react'
import AvailabilityContext from '#context/AvailabilityContext'
import Parent from './utils/Parent'
import { isEmpty } from 'lodash'
import components from '#config/components'
import { TimeFormat, FunctionChildren } from '#typings/index'
import { DeliveryLeadTime } from '#reducers/AvailabilityReducer'
import ItemContext from '#context/ItemContext'
import SkuChildrenContext from '#context/SkuChildrenContext'

const propTypes = components.AvailabilityTemplate.propTypes
const defaultProps = components.AvailabilityTemplate
  .defaultProps as AvailabilityTemplateProps
const displayName = components.AvailabilityTemplate.displayName

type AvailabilityTemplateChildrenProps = FunctionChildren<
  Omit<AvailabilityTemplateProps, 'children'> &
    DeliveryLeadTime & { text: string; quantity: number }
>

type AvailabilityTemplateProps = {
  children?: AvailabilityTemplateChildrenProps
  timeFormat?: TimeFormat
  showShippingMethodName?: boolean
  showShippingMethodPrice?: boolean
} & JSX.IntrinsicElements['p']

const AvailabilityTemplate: FunctionComponent<AvailabilityTemplateProps> = (
  props
) => {
  const {
    timeFormat,
    showShippingMethodName,
    showShippingMethodPrice,
    children,
    ...p
  } = props
  let { min, max, shipping_method, quantity } = useContext(AvailabilityContext)
  const { item } = useContext(ItemContext)
  const { sku } = useContext(SkuChildrenContext)
  const text: string[] = []
  if (item && sku) {
    const code = sku.code as string
    const currentItem = item[code]
    if (currentItem) {
      const [level] = currentItem.inventory?.levels || []
      const [delivery] = level?.delivery_lead_times || []
      if (delivery) {
        min = delivery?.min
        max = delivery?.max
        shipping_method = delivery?.shipping_method
      }
      quantity = currentItem.inventory.quantity
    }
  }
  const mn = !isEmpty(min) && timeFormat ? min?.[timeFormat] : ''
  const mx = !isEmpty(max) && timeFormat ? max?.[timeFormat] : ''
  const shippingMethodPrice =
    showShippingMethodPrice && shipping_method?.formatted_price_amount
      ? `(${shipping_method?.formatted_price_amount})`
      : ''
  const name =
    showShippingMethodName && shipping_method
      ? `with ${shipping_method.name}`
      : ''
  if (quantity && quantity > 0) {
    text.push('Available')
    if (mn && mx) {
      text.push(`in ${mn} - ${mx} ${timeFormat} ${name} ${shippingMethodPrice}`)
    }
  } else if (quantity === 0) {
    text.push('Out of stock')
  }
  const parentProps = {
    min,
    max,
    shipping_method,
    quantity,
    text: text.join(' '),
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{text.join(' ')}</p>
  )
}

AvailabilityTemplate.propTypes = propTypes
AvailabilityTemplate.defaultProps = defaultProps
AvailabilityTemplate.displayName = displayName

export default AvailabilityTemplate
