import type { JSX } from "react"
import type { BaseAmountComponent } from "#typings"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function ShippingAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

export default ShippingAmount
