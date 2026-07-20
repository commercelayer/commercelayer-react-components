import type { JSX } from "react"
import type { BaseAmountComponent } from "#typings"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function TaxesAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base="amount" type="total_tax" {...props} />
}

export default TaxesAmount
