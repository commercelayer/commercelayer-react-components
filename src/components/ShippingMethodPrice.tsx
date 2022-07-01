import { useState, useEffect, useContext } from 'react'
import getAmount from '#utils/getAmount'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { BaseAmountComponent } from '#typings/index'

const propTypes = components.ShippingMethodPrice.propTypes
const displayName = components.ShippingMethodPrice.displayName

type Props = BaseAmountComponent & {
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

export function ShippingMethodPrice(props: Props) {
  const {
    base = 'price_amount',
    type = 'for_shipment',
    format = 'formatted',
    labelFreeOver = 'Free',
    ...p
  } = props
  const { shippingMethod } = useContext(ShippingMethodChildrenContext)
  const [price, setPrice] = useState('')
  const [priceCents, setPriceCents] = useState(0)
  useEffect(() => {
    if (shippingMethod) {
      const p = getAmount({
        base,
        type,
        format,
        obj: shippingMethod,
      })
      setPrice(p)
      const pCents = getAmount<number>({
        base: 'price_amount',
        type: 'for_shipment',
        format: 'cents',
        obj: shippingMethod,
      })
      setPriceCents(pCents)
    }
    return (): void => {
      setPrice('')
      setPriceCents(0)
    }
  }, [shippingMethod])
  const parentProps = {
    price,
    ...p,
  }
  const finalPrice = priceCents === 0 ? labelFreeOver : price
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{finalPrice}</span>
  )
}

ShippingMethodPrice.propTypes = propTypes
ShippingMethodPrice.displayName = displayName

export default ShippingMethodPrice
