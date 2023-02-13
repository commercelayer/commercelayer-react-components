import AvailabilityContext from '#context/AvailabilityContext'
import Parent from '#components/utils/Parent'
import { TimeFormat, ChildrenFunction } from '#typings/index'
import { DeliveryLeadTime } from '#reducers/AvailabilityReducer'
import useCustomContext from '#utils/hooks/useCustomContext'

interface AvailabilityTemplateChildrenProps
  extends Omit<Props, 'children'>,
    DeliveryLeadTime {
  text: string
  quantity: number
}

type FormatRules =
  | {
      /**
       * Set time format for shipping method
       */
      timeFormat?: TimeFormat
      /**
       * Show shipping method name
       */
      showShippingMethodName?: false
      /**
       * Show shipping method price
       */
      showShippingMethodPrice?: false
    }
  | {
      timeFormat: TimeFormat
      showShippingMethodName: true
      showShippingMethodPrice?: boolean
    }
  | {
      timeFormat: TimeFormat
      showShippingMethodName?: boolean
      showShippingMethodPrice: true
    }

type Props = {
  children?: ChildrenFunction<AvailabilityTemplateChildrenProps>
} & Omit<JSX.IntrinsicElements['span'], 'children'> &
  FormatRules

export function AvailabilityTemplate(props: Props): JSX.Element {
  const {
    timeFormat,
    showShippingMethodName,
    showShippingMethodPrice,
    children,
    ...p
  } = props
  const {
    min,
    max,
    shipping_method: shippingMethod,
    quantity,
    skuCode
  } = useCustomContext({
    context: AvailabilityContext,
    contextComponentName: 'AvailabilityContainer',
    currentComponentName: 'AvailabilityTemplate',
    key: 'parent'
  })
  const text: string[] = []
  const mn = min != null && timeFormat != null ? min?.[timeFormat] : ''
  const mx = max != null && timeFormat != null ? max?.[timeFormat] : ''
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
    if (mn && mx && timeFormat) {
      text.push(`in ${mn} - ${mx} ${timeFormat} ${name} ${shippingMethodPrice}`)
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
    <span data-testid={skuCode ? `availability-${skuCode}` : ''} {...p}>
      {text.join(' ')}
    </span>
  )
}

export default AvailabilityTemplate
