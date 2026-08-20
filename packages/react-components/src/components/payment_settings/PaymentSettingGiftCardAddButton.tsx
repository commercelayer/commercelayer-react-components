import { type JSX, type ReactNode, useContext } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import type { ChildrenFunction } from "#typings/index"

interface ChildrenProps extends Omit<Props, "children"> {
  handleClick: () => void
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements["button"], "children" | "onClick">

/**
 * Brings the code input back after a gift card has been applied.
 *
 * Renders only when another card could actually be applied and the input is
 * currently hidden, so it and `<PaymentSettingGiftCardInput>` are never both on
 * screen — and neither appears once the order is covered.
 */
export function PaymentSettingGiftCardAddButton(props: Props): JSX.Element | null {
  const { children, label = "Add another gift card", ...p } = props
  const { canAddGiftCard, isInputVisible, showInput, readonly } = useContext(
    PaymentSettingGiftCardContext
  )

  if (readonly === true || canAddGiftCard !== true || isInputVisible === true) return null

  const handleClick = (): void => {
    showInput?.()
  }
  const parentProps = { ...props, handleClick }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type="button" onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

export default PaymentSettingGiftCardAddButton
