import { type JSX, useContext, useMemo } from "react"
import Parent from "#components/utils/Parent"
import LineItemChildrenContext from "#context/LineItemChildrenContext"
import type { BaseAmountComponent, BasePriceType } from "#typings/index"
import getAmount from "#utils/getAmount"

type Props = BaseAmountComponent & {
  type?: BasePriceType
}

export function LineItemAmount(props: Props): JSX.Element {
  const { format = "formatted", type = "total", ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const price = useMemo(
    () => (lineItem ? getAmount({ base: "amount", type, format, obj: lineItem }) : ""),
    [lineItem, type, format]
  )
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

export default LineItemAmount
