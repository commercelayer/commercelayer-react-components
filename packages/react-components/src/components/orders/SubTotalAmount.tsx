import type { JSX } from "react"
import type { BaseAmountComponent } from "#typings"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function SubTotalAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base="amount" type="subtotal" {...props} />
}

export default SubTotalAmount
