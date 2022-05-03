import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from 'react'
import getAmount from '#utils/getAmount'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { BaseAmountComponent } from '#typings/index'
import OrderContext from '#context/OrderContext'
import { isNumber } from 'lodash'

const propTypes = components.ShippingMethodPrice.propTypes
const displayName = components.ShippingMethodPrice.displayName

export type ShippingMethodPriceProps = BaseAmountComponent & {
  labelFreeOver?: string
} & (
    | {
        type?: 'amount'
        base?: 'freeOver'
      }
    | {
        type?: 'amount' | 'amountForShipment'
        base?: 'price'
      }
  )

const ShippingMethodPrice: FunctionComponent<ShippingMethodPriceProps> = (
  props
) => {
  const {
    format = 'formatted',
    type = 'amount',
    base = 'price',
    labelFreeOver = 'Free',
    ...p
  } = props
  const { shippingMethod } = useContext(ShippingMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState('')
  const [freeOverAmountCents, setFreeOverAmountCents] = useState(0)
  useEffect(() => {
    if (shippingMethod) {
      const p = getAmount({
        base,
        type,
        format,
        obj: shippingMethod,
      })
      setPrice(p)
      const c = getAmount<number>({
        base: 'free_over',
        type,
        format: 'cents',
        obj: shippingMethod,
      })
      setFreeOverAmountCents(c)
    }
    return (): void => {
      setPrice('')
      setFreeOverAmountCents(0)
    }
  }, [shippingMethod])
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>
      {order?.total_amount_cents &&
      isNumber(freeOverAmountCents) &&
      freeOverAmountCents < order.total_amount_cents
        ? labelFreeOver
        : order?.total_amount_cents === 0
        ? labelFreeOver
        : price}
    </span>
  )
}

ShippingMethodPrice.propTypes = propTypes
ShippingMethodPrice.displayName = displayName

export default ShippingMethodPrice
