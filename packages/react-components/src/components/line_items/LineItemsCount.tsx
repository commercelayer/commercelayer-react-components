import { useState, useEffect, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import getLineItemsCount, { type TypeAccepted } from '#utils/getLineItemsCount'
import LineItemContext from '#context/LineItemContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  typeAccepted?: TypeAccepted[]
}

export function LineItemsCount(props: Props): JSX.Element {
  const { children, typeAccepted, ...p } = props
  const { lineItems } = useCustomContext({
    context: LineItemContext,
    contextComponentName: 'LineItemsContainer',
    currentComponentName: 'LineItemsCount',
    key: 'lineItems'
  })
  const [quantity, setQuantity] = useState(0)
  useEffect(() => {
    if (lineItems && lineItems.length > 0) {
      const qty = getLineItemsCount({
        lineItems: lineItems || [],
        typeAccepted
      })
      setQuantity(qty)
    }
    return (): void => {
      setQuantity(0)
    }
  }, [lineItems, typeAccepted])
  const parentProps = {
    quantity,
    typeAccepted,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

export default LineItemsCount
