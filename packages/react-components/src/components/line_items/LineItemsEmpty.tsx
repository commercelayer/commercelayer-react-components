import { useContext, useState, useEffect, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import getLineItemsCount from '#utils/getLineItemsCount'
import LineItemContext from '#context/LineItemContext'
import type { ChildrenFunction } from '#typings/index'

interface ChildrenProps extends Omit<Props, 'children'> {
  quantity: number
  text: string
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  text?: string
}

export function LineItemsEmpty(props: Props): JSX.Element | null {
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
    ...p
  }
  return children ? <Parent {...parentProps}>{children}</Parent> : emptyText
}

export default LineItemsEmpty
