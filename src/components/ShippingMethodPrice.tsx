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
    type = 'amountForShipment',
    base = 'price',
    labelFreeOver = 'Free',
    ...p
  } = props
  const { shippingMethod } = useContext(ShippingMethodChildrenContext)
  const [price, setPrice] = useState('')
  const [priceCent, setPriceCent] = useState(0)
  useEffect(() => {
    const p = getAmount(
      base,
      type,
      format,
      shippingMethod as Record<string, string>
    ) as string
    setPrice(p)
    const c = getAmount(
      base,
      type,
      'cents',
      shippingMethod as Record<string, string>
    ) as number
    setPriceCent(c)
    return (): void => {
      setPrice('')
      setPriceCent(0)
    }
  }, [shippingMethod])
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{priceCent === 0 ? labelFreeOver : price}</span>
  )
}

ShippingMethodPrice.propTypes = propTypes
ShippingMethodPrice.displayName = displayName

export default ShippingMethodPrice
