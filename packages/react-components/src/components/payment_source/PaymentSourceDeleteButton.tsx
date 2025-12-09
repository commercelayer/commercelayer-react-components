import { type JSX, type ReactNode, useContext } from "react"
import Parent from "#components/utils/Parent"
import CustomerPaymentSourceContext from "#context/CustomerPaymentSourceContext"
import type { ChildrenFunction } from "#typings"

interface CustomComponent extends Omit<Props, "children"> { }

type Props = {
  children?: ChildrenFunction<CustomComponent>
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements["button"], "onClick">
export function PaymentSourceDeleteButton({
  children,
  label = "Delete",
  ...props
}: Props): JSX.Element | null {
  const { handleDeleteClick } = useContext(CustomerPaymentSourceContext)
  const parentProps = {
    label,
    handleDeleteClick,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : handleDeleteClick != null ? (
    <button {...props} onClick={handleDeleteClick as any}>
      {label}
    </button>
  ) : null
}

export default PaymentSourceDeleteButton
