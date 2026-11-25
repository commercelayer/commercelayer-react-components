import type { GiftCardRemoval } from "@commercelayer/core-components"
import { type JSX, type ReactNode, useContext } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardItemContext from "#context/PaymentSettingGiftCardItemContext"
import type { ChildrenFunction } from "#typings/index"

interface ChildrenProps extends Omit<Props, "children"> {
  handleClick: () => Promise<void>
  disabled: boolean
  /**
   * Which operation this click performs. `refund` means the card was charged
   * and the money is being sent back — worth different wording, or a
   * confirmation, and worth explaining because it is the slow one.
   */
  removal: GiftCardRemoval
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements["button"], "children" | "onClick">

/**
 * Takes one gift card back off the order.
 *
 * The click means one of two things, and the library decides which from the
 * card's state: **discard** deletes an unauthorized Payment Session and moves
 * no balance, while **refund** gives back a card that has already been charged.
 * `removal` says which, so an application can word them differently — the
 * choice itself is a domain rule and is not the consumer's to make.
 *
 * Renders nothing when neither is possible. Three ways to get there, and only
 * one is permanent: the subtree is readonly; the order has left `pending`,
 * which is the only status a storefront token may refund a gift card in; or the
 * charge is still settling, where the API would refuse the delete and a refund
 * has no capture to point at yet.
 */
export function PaymentSettingGiftCardRemoveButton(props: Props): JSX.Element | null {
  const { children, label = "Remove", ...p } = props
  const { removal, isRemoving, removeGiftCard } = useContext(PaymentSettingGiftCardItemContext)

  if (removal == null) return null

  const handleClick = async (): Promise<void> => {
    if (isRemoving === true) return
    await removeGiftCard?.()
  }
  // `isRemoving` comes from the list, which holds it per row: a refund runs for
  // seconds, and an application may want the whole row to say so.
  const parentProps = { ...props, handleClick, disabled: isRemoving === true, removal }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={isRemoving === true}
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
