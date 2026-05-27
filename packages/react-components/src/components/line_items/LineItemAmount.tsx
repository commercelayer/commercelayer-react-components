import { useContext, useMemo, type JSX } from "react"
import getAmount from "#utils/getAmount"
import LineItemChildrenContext from "#context/LineItemChildrenContext"
import Parent from "#components/utils/Parent"
import type { BaseAmountComponent, BasePriceType } from "#typings/index"

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
