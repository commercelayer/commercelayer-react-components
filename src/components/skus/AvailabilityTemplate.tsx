import { useContext } from 'react'
import AvailabilityContext from '#context/AvailabilityContext'
import Parent from '../utils/Parent'
import { isEmpty } from 'lodash'
import { TimeFormat, ChildrenFunction } from '#typings/index'
import { DeliveryLeadTime } from '#reducers/AvailabilityReducer'
import ItemContext from '#context/ItemContext'
import SkuChildrenContext from '#context/SkuChildrenContext'

interface AvailabilityTemplateChildrenProps
  extends Omit<Props, 'children'>,
    DeliveryLeadTime {
  text: string
  quantity: number
}

type Props = {
  children?: ChildrenFunction<AvailabilityTemplateChildrenProps>
  timeFormat?: TimeFormat
  showShippingMethodName?: boolean
  showShippingMethodPrice?: boolean
} & JSX.IntrinsicElements['p']

export function AvailabilityTemplate(props: Props): JSX.Element {
  const {
    timeFormat,
    showShippingMethodName,
    showShippingMethodPrice,
    children,
    ...p
  } = props
  let {
    min,
    max,
    shipping_method: shippingMethod,
    quantity
  } = useContext(AvailabilityContext)
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
        shippingMethod = delivery?.shipping_method
      }
      quantity = currentItem.inventory.quantity
    }
  }
  const mn = !isEmpty(min) && timeFormat ? min?.[timeFormat] : ''
  const mx = !isEmpty(max) && timeFormat ? max?.[timeFormat] : ''
  const shippingMethodPrice =
    showShippingMethodPrice && shippingMethod?.formatted_price_amount
      ? `(${shippingMethod?.formatted_price_amount})`
      : ''
  const name =
    showShippingMethodName && shippingMethod
      ? `with ${shippingMethod.name}`
      : ''
  if (quantity && quantity > 0) {
    text.push('Available')
    if (mn && mx) {
      text.push(
        `in ${mn} - ${mx} ${timeFormat ?? ''} ${name} ${shippingMethodPrice}`
      )
    }
  } else if (quantity === 0) {
    text.push('Out of stock')
  }
  const parentProps = {
    min,
    max,
    shipping_method: shippingMethod,
    quantity,
    text: text.join(' '),
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{text.join(' ')}</p>
  )
}

export default AvailabilityTemplate
