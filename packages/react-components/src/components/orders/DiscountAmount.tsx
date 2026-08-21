import type { JSX } from "react"
import type { BaseAmountComponent } from "#typings"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function DiscountAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

export default DiscountAmount
