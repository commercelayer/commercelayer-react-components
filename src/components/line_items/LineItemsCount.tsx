import { useContext, useState, useEffect } from 'react'
import Parent from '#components-utils/Parent'
import getLineItemsCount, { TypeAccepted } from '#utils/getLineItemsCount'
import LineItemContext from '#context/LineItemContext'
import { ChildrenFunction } from '#typings/index'

interface ChildrenProps extends Omit<Props, 'children'> {
  quantity: number
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  typeAccepted?: TypeAccepted[]
} & JSX.IntrinsicElements['span']

export function LineItemsCount(props: Props): JSX.Element {
  const { children, typeAccepted, ...p } = props
  const { lineItems } = useContext(LineItemContext)
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
