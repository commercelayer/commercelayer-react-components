import { type JSX, useMemo } from "react"
import Parent from "#components/utils/Parent"
import LineItemContext from "#context/LineItemContext"
import type { ChildrenFunction } from "#typings/index"
import getLineItemsCount, { type TypeAccepted } from "#utils/getLineItemsCount"
import useCustomContext from "#utils/hooks/useCustomContext"

interface ChildrenProps extends Omit<Props, "children"> {
  quantity: number
}

interface Props extends Omit<JSX.IntrinsicElements["span"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
  typeAccepted?: TypeAccepted[]
}

export function LineItemsCount(props: Props): JSX.Element {
  const { children, typeAccepted, ...p } = props
  const { lineItems } = useCustomContext({
    context: LineItemContext,
    contextComponentName: "LineItems",
    currentComponentName: "LineItemsCount",
    key: "lineItems",
  })
  const quantity = useMemo(
    () => (lineItems && lineItems.length > 0 ? getLineItemsCount({ lineItems, typeAccepted }) : 0),
    [lineItems, typeAccepted]
  )
  const parentProps = {
    quantity,
    typeAccepted,
    ...p,
  }
  return children ? <Parent {...parentProps}>{children}</Parent> : <span {...p}>{quantity}</span>
}

export default LineItemsCount
