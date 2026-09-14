import { giftCardRemoval } from "@commercelayer/core-components"
import { type JSX, type ReactNode, useContext, useState } from "react"
import OrderContext from "#context/OrderContext"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import PaymentSettingGiftCardItemContext from "#context/PaymentSettingGiftCardItemContext"

interface Props {
  children?: ReactNode
}

/**
 * Renders `children` once per applied gift card, oldest first.
 *
 * Shows only cards that are actually paying for something: one whose
 * authorization failed, or whose money has been given back, took nothing, and
 * listing it would tell the shopper a payment is in place when none is.
 *
 * Stays visible in readonly mode and when the order is fully covered — what the
 * shopper applied is exactly what they need to see then. Only the controls that
 * change things disappear.
 */
export function PaymentSettingGiftCardList({ children }: Props): JSX.Element | null {
  const { giftCardSessions, removeGiftCard, readonly } = useContext(PaymentSettingGiftCardContext)
  const { order } = useContext(OrderContext)
  // Held here rather than in the remove button so a whole row can be rendered
  // as busy, not just its control. That matters now that removing a charged
  // card is a refund: a background job and a poll, seconds rather than one
  // request.
  const [removingId, setRemovingId] = useState<string | null>(null)

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
            // Two different operations behind one gesture, and which one it is
            // depends on whether the card has been charged and on whether the
            // order is still `pending` — the only status a storefront token may
            // refund a gift card in. The rule itself lives in the domain layer.
            removal: giftCardRemoval({ paymentSession, order, readonly }),
            isRemoving: removingId === paymentSession.id,
            removeGiftCard: async () => {
              setRemovingId(paymentSession.id)
              try {
                await removeGiftCard?.(paymentSession.id)
              } finally {
                setRemovingId(null)
              }
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
