import { type JSX, useContext, useMemo } from "react"
import Parent from "#components/utils/Parent"
import LineItemContext from "#context/LineItemContext"
import type { ChildrenFunction } from "#typings/index"
import getLineItemsCount from "#utils/getLineItemsCount"

interface ChildrenProps extends Omit<Props, "children"> {
  quantity: number
  text: string
}

interface Props extends Omit<JSX.IntrinsicElements["span"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
  text?: string
}

export function LineItemsEmpty(props: Props): JSX.Element | null {
  const { children, text = "Your shopping bag is empty", ...p } = props
  const { lineItems } = useContext(LineItemContext)
  const quantity = useMemo(() => {
    if (lineItems == null) return undefined
    return getLineItemsCount({ lineItems })
  }, [lineItems])
  const emptyText = quantity === 0 ? <span {...p}>{text}</span> : null
  const parentProps = {
    quantity,
    text,
    ...p,
  }
  return children ? <Parent {...parentProps}>{children}</Parent> : emptyText
}

export default LineItemsEmpty
