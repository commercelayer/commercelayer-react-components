import type { JSX } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardItemContext, {
  type InitialPaymentSettingGiftCardItemContext,
} from "#context/PaymentSettingGiftCardItemContext"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"

interface ChildrenProps
  extends Omit<Props, "children">,
    Omit<InitialPaymentSettingGiftCardItemContext, "removeGiftCard"> {}

interface Props extends Omit<JSX.IntrinsicElements["div"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
}

/**
 * One applied gift card.
 *
 * The code and the amount come through as render-prop arguments rather than as
 * components of their own: `formattedAmount` is formatted by the API, so a
 * component would only be re-wrapping a string, and consumers style these two
 * fields differently anyway.
 *
 * Note the amount is what this card covers of the order, **not** the card's
 * balance. The server caps a gift card session at whatever was still owed, and
 * the balance is not served on a session at all.
 */
export function PaymentSettingGiftCardListItem(props: Props): JSX.Element {
  const { children, ...p } = props
  const { paymentSession, code, formattedAmount, amountCents, isRemovable, isRemoving } =
    useCustomContext({
      context: PaymentSettingGiftCardItemContext,
      contextComponentName: "PaymentSettingGiftCardList",
      currentComponentName: "PaymentSettingGiftCardListItem",
      key: "paymentSession",
    })

  const parentProps = {
    ...props,
    paymentSession,
    code,
    formattedAmount,
    amountCents,
    isRemovable,
    isRemoving,
  }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <div {...p}>
      <span>{code}</span>
      <span>{formattedAmount}</span>
    </div>
  )
}

export default PaymentSettingGiftCardListItem
