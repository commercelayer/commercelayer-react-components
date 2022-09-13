import { useContext, useState, useEffect } from 'react'
import Parent from '#components-utils/Parent'
import getLineItemsCount from '#utils/getLineItemsCount'
import LineItemContext from '#context/LineItemContext'

import { FunctionChildren } from '#typings/index'

export type LineItemsCountType = FunctionChildren<
  Omit<LineItemsCountProps, 'children'> & {
    quantity: number
    text: string
  }
>

type LineItemsCountProps = {
  children?: LineItemsCountType
  text?: string
} & JSX.IntrinsicElements['span']

export function LineItemsEmpty(props: LineItemsCountProps) {
  const { children, text = 'Your shopping bag is empty', ...p } = props
  const { lineItems } = useContext(LineItemContext)
  const [quantity, setQuantity] = useState<undefined | number>()
  const emptyText = quantity === 0 ? <span {...p}>{text}</span> : null
  useEffect(() => {
    if (lineItems) {
      if (lineItems.length > 0) {
        const qty = getLineItemsCount({ lineItems: lineItems || [] })
        setQuantity(qty)
      } else {
        setQuantity(0)
      }
    }
    return (): void => {
      setQuantity(undefined)
    }
  }, [lineItems])
  const parentProps = {
    quantity,
    text,
    ...p,
  }
  return children ? <Parent {...parentProps}>{children}</Parent> : emptyText
}

export default LineItemsEmpty
