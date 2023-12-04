import { useState, useEffect, useContext } from 'react'
import getAmount from '#utils/getAmount'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from '#components/utils/Parent'
import { type BaseAmountComponent, type BasePriceType } from '#typings/index'
import LineItemBundleChildrenContext from '#context/LineItemBundleChildrenContext'

type Props = BaseAmountComponent & {
  type?: BasePriceType
}

export function LineItemAmount(props: Props): JSX.Element {
  const { format = 'formatted', type = 'total', ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { lineItem: lineItemBundle } = useContext(LineItemBundleChildrenContext)
  const [price, setPrice] = useState('')
  const item = lineItem ?? lineItemBundle
  useEffect(() => {
    if (item) {
      const p = getAmount({
        base: 'amount',
        type,
        format,
        obj: item
      })
      setPrice(p)
    }
    return (): void => {
      setPrice('')
    }
  }, [item])
  const parentProps = {
    price,
    ...p
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

export default LineItemAmount
