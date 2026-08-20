import { type JSX, type ReactNode, useContext } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import type { ChildrenFunction } from "#typings/index"

interface ChildrenProps extends Omit<Props, "children"> {
  handleClick: () => Promise<void>
  disabled: boolean
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements["button"], "children" | "onClick">

/**
 * Applies the code that has been typed.
 *
 * Rendered and hidden on the same conditions as the input, so the pair never
 * comes apart. Disabled while empty or while a request is in flight — an empty
 * code fails a length validation server-side, which is not worth a round trip.
 */
export function PaymentSettingGiftCardSubmitButton(props: Props): JSX.Element | null {
  const { children, label = "Apply", ...p } = props
  const { canAddGiftCard, isInputVisible, isApplying, readonly, code, applyGiftCard } = useContext(
    PaymentSettingGiftCardContext
  )

  if (readonly === true || canAddGiftCard !== true || isInputVisible !== true) return null

  const trimmed = (code ?? "").trim()
  const disabled = isApplying === true || trimmed === ""

  const handleClick = async (): Promise<void> => {
    if (disabled) return
    await applyGiftCard?.(trimmed)
  }
  const parentProps = { ...props, handleClick, disabled }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        void handleClick()
      }}
      {...p}
    >
      {label}
    </button>
  )
}

export default PaymentSettingGiftCardSubmitButton
