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

const propTypes = components.ShippingMethodPrice.propTypes
const displayName = components.ShippingMethodPrice.displayName

export type ShippingMethodPriceProps = BaseAmountComponent & {
  type?: 'amount'
}

const ShippingMethodPrice: FunctionComponent<ShippingMethodPriceProps> = (
  props
) => {
  const { format = 'formatted', type = 'amount', ...p } = props
  const { shippingMethod } = useContext(ShippingMethodChildrenContext)
  const [price, setPrice] = useState('')
  useEffect(() => {
    const p = getAmount(
      'price',
      type,
      format,
      shippingMethod as Record<string, string>
    )
    setPrice(p)
    return (): void => {
      setPrice('')
    }
  }, [shippingMethod])
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

ShippingMethodPrice.propTypes = propTypes
ShippingMethodPrice.displayName = displayName

export default ShippingMethodPrice
