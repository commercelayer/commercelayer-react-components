import { type JSX, type ReactNode, useContext, useState } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardItemContext from "#context/PaymentSettingGiftCardItemContext"
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
 * Takes one gift card back off the order.
 *
 * Renders nothing once the card has been charged. Authorizing a gift card
 * debits the balance straight away — the setting forces auto-capture — and from
 * there only a refund could return it, which this iteration does not implement.
 * The API would refuse the delete anyway, and surfaces that refusal as an
 * unhandled 500, so offering the control would be offering a crash.
 */
export function PaymentSettingGiftCardRemoveButton(props: Props): JSX.Element | null {
  const { children, label = "Remove", ...p } = props
  const { isRemovable, removeGiftCard } = useContext(PaymentSettingGiftCardItemContext)
  const [isRemoving, setIsRemoving] = useState(false)

  if (isRemovable !== true) return null

  const handleClick = async (): Promise<void> => {
    if (isRemoving) return
    setIsRemoving(true)
    try {
      await removeGiftCard?.()
    } finally {
      setIsRemoving(false)
    }
  }
  const parentProps = { ...props, handleClick, disabled: isRemoving }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={isRemoving}
      onClick={() => {
        void handleClick()
      }}
      {...p}
    >
      {label}
    </button>
  )
}

export default PaymentSettingGiftCardRemoveButton
