import { useState, useEffect, useContext, type JSX } from 'react';
import getAmount from '#utils/getAmount'
import ShippingMethodChildrenContext from '#context/ShippingMethodChildrenContext'
import Parent from '#components/utils/Parent'
import type { BaseAmountComponent } from '#typings/index'

type Props = BaseAmountComponent & {
  /**
   * The label to show when the price is free
   */
  labelFreeOver?: string
  /**
   * The label to show when the price is external
   */
  labelExternal?: string
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

export function ShippingMethodPrice(props: Props): JSX.Element {
  const {
    base = 'price_amount',
    type = 'for_shipment',
    format = 'formatted',
    labelFreeOver = 'Free',
    labelExternal = 'Price estimates after the shipping method selection',
    ...p
  } = props
  const { shippingMethod } = useContext(ShippingMethodChildrenContext)
  const [price, setPrice] = useState('')
  const [priceCents, setPriceCents] = useState(0)
  const scheme = shippingMethod?.scheme
  useEffect(() => {
    if (shippingMethod) {
      const p = getAmount({
        base,
        type,
        format,
        obj: shippingMethod
      })
      setPrice(p)
      const pCents = getAmount<number>({
        base: 'price_amount',
        type: 'for_shipment',
        format: 'cents',
        obj: shippingMethod
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
    scheme,
    ...p
  }
  const finalPrice = priceCents === 0 ? labelFreeOver : price
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{scheme === 'external' ? labelExternal : finalPrice}</span>
  )
}

export default ShippingMethodPrice
