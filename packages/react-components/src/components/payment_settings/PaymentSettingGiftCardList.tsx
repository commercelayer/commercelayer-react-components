import { hasLiveAuthorization } from "@commercelayer/core-components"
import { type JSX, type ReactNode, useContext } from "react"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import PaymentSettingGiftCardItemContext from "#context/PaymentSettingGiftCardItemContext"

interface Props {
  children?: ReactNode
}

/**
 * Renders `children` once per applied gift card, oldest first.
 *
 * Shows only cards that are actually paying for something: one whose
 * authorization failed, or that has been refunded, took no money, and listing
 * it would tell the shopper a payment is in place when none is.
 *
 * Stays visible in readonly mode and when the order is fully covered — what the
 * shopper applied is exactly what they need to see then. Only the controls that
 * change things disappear.
 */
export function PaymentSettingGiftCardList({ children }: Props): JSX.Element | null {
  const { giftCardSessions, removeGiftCard, readonly } = useContext(PaymentSettingGiftCardContext)

  if (giftCardSessions == null || giftCardSessions.length === 0) return null

  return (
    <>
      {giftCardSessions.map((paymentSession) => (
        <PaymentSettingGiftCardItemContext.Provider
          key={paymentSession.id}
          value={{
            paymentSession,
            code: paymentSession.gift_card_code,
            formattedAmount: paymentSession.formatted_amount,
            amountCents: paymentSession.amount_cents,
            // Charged cards are here to stay: authorizing debits the balance
            // immediately and only a refund would return it, which this
            // iteration does not implement.
            isRemovable: readonly !== true && !hasLiveAuthorization(paymentSession),
            removeGiftCard: async () => {
              await removeGiftCard?.(paymentSession.id)
            },
          }}
        >
          {children}
        </PaymentSettingGiftCardItemContext.Provider>
      ))}
    </>
  )
}

export default PaymentSettingGiftCardList
