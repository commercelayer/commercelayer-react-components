import type { JSX } from "react"
import type { BaseAmountComponent } from "#typings"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function AdjustmentAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base="amount" type="adjustment" {...props} />
}

export default AdjustmentAmount
