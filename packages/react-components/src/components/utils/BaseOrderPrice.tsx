import OrderContext from '#context/OrderContext'
import getAmount from '#utils/getAmount'
import Parent from './Parent'
import { useState, useEffect, useContext, type JSX } from 'react';
import type { PropsType } from '#utils/PropsType'
import type { baseOrderPricePropTypes } from '#typings'
import isEmpty from 'lodash/isEmpty'

export type BaseOrderPriceProps = PropsType<
  typeof baseOrderPricePropTypes,
  unknown
> &
  Omit<JSX.IntrinsicElements['span'], 'children'| 'ref'>

export function BaseOrderPrice(props: BaseOrderPriceProps): JSX.Element {
  const { format = 'formatted', base, type, children, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState('')
  const [cents, setCents] = useState(0)
  useEffect(() => {
    const p = getAmount({
      base,
      type,
      format: format as string,
      obj: order || {}
    })
    const c = getAmount<number>({
      base,
      type,
      format: 'cents',
      obj: order || {}
    })
    setPrice(p)
    setCents(c)
    return (): void => {
      if (isEmpty(order)) {
        setPrice('')
      }
    }
  }, [order])
  const parentProps = {
    priceCents: cents,
    price,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

export default BaseOrderPrice
