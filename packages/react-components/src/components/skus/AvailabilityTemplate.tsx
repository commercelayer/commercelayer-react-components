import AvailabilityContext from '#context/AvailabilityContext'
import Parent from '#components/utils/Parent'
import type { TimeFormat, ChildrenFunction } from '#typings/index'
import type { DeliveryLeadTime } from '#reducers/AvailabilityReducer'
import useCustomContext from '#utils/hooks/useCustomContext'

import type { JSX } from "react";

interface AvailabilityTemplateChildrenProps
  extends Omit<Props, 'children'>,
    DeliveryLeadTime {
  text: string
  quantity: number
}

type FormatRules =
  | {
      /**
       * Set time format for shipping method. When not set, ``delivery_lead_times`` will not be displayed.
       * When set, `delivery_lead_times` for the first shipping method found in the inventory model, will be displayed in the format specified.
       */
      timeFormat?: TimeFormat
      /**
       * Show shipping method name. Requires `timeFormat` to be set.
       */
      showShippingMethodName?: false
      /**
       * Show shipping method price. Requires `timeFormat` to be set.
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
  labels?: {
    available?: string
    outOfStock?: string
    negativeStock?: string
  }
} & Omit<JSX.IntrinsicElements['span'], 'children' | 'ref'> &
  FormatRules

/**
 * The AvailabilityTemplate component displays the availability of the SKU specified
 * in the parent `<AvailabilityContainer>` component.
 *
 * It is possible to customize the text displayed in case of `available`, `outOfStock` or `negativeStock.
 * It is also possible to show delivery lead time and either shipping method name and/or price.
 * This information will be retrieve from the first shipping method found in the inventory model.
 *
 * <span type="Requirement" type="info">
 * It must to be used inside the `<AvailabilityContainer>` component.
 * </span>
 */
export function AvailabilityTemplate(props: Props): JSX.Element {
  const {
    timeFormat,
    showShippingMethodName,
    showShippingMethodPrice,
    children,
    labels,
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
  if (quantity != null) {
    if (quantity > 0) {
      text.push(labels?.available ?? 'Available')
      if (mn && mx && timeFormat) {
        text.push(
          `in ${mn} - ${mx} ${timeFormat} ${name} ${shippingMethodPrice}`
        )
      }
    } else if (quantity === 0) {
      text.push(labels?.outOfStock ?? 'Out of stock')
    } else if (quantity < 0) {
      text.push(labels?.negativeStock ?? 'Out of stock')
    }
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
