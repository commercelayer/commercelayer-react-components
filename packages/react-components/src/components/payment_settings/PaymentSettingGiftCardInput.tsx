import { type ChangeEvent, type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import type { ChildrenFunction } from "#typings/index"

interface ChildrenProps extends Omit<Props, "children"> {
  value: string
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
  disabled: boolean
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
} & Omit<JSX.IntrinsicElements["input"], "value" | "onChange">

/**
 * Where the shopper types a gift card code.
 *
 * Renders nothing when another card cannot be applied — the order is already
 * covered, or something has been authorized — and nothing in readonly mode.
 * That rule lives here rather than in the consuming application because
 * applying a card that is not needed fails with a 422 the shopper cannot make
 * sense of.
 *
 * After the first card the input steps aside for
 * `<PaymentSettingGiftCardAddButton>`, so a shopper who is done is not left
 * looking at an empty field.
 */
export function PaymentSettingGiftCardInput(props: Props): JSX.Element | null {
  const { children, ...p } = props
  const { canAddGiftCard, isInputVisible, isApplying, readonly, code, setCode } = useContext(
    PaymentSettingGiftCardContext
  )

  if (readonly === true || canAddGiftCard !== true || isInputVisible !== true) return null

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCode?.(event.target.value)
  }
  const disabled = isApplying === true
  const parentProps = { ...props, value: code ?? "", handleChange, disabled }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      type="text"
      name="gift_card_code"
      value={code ?? ""}
      disabled={disabled}
      onChange={handleChange}
      {...p}
    />
  )
}

export default PaymentSettingGiftCardInput
