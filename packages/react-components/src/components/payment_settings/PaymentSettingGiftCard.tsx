import { applyGiftCard, removeGiftCard } from "@commercelayer/core-components"
import { type JSX, type ReactNode, useCallback, useContext, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { BaseError } from "#typings/errors"

interface Props {
  children?: ReactNode
  /**
   * Show what was applied without letting anything change — a placed order, for
   * instance. Hides the input and the remove controls.
   */
  readonly?: boolean
}

/**
 * Gift cards on the `payment_sessions` model.
 *
 * A gift card is a **payment**, not a discount: spending one creates a Payment
 * Session, the order total never changes, and what drops is the amount still
 * owed. Zero or more may be applied, and whatever is left is paid by one other
 * Payment Setting.
 *
 * Deliberately **outside** `<PaymentSetting>`. Gift cards are additive rather
 * than one of the alternatives the shopper picks between, so they do not belong
 * in a radio group: several can be active at once, and putting them there would
 * mean more than one selection in a group with room for exactly one.
 *
 * Renders nothing unless the order is on the `payment_sessions` model and has a
 * gift card Payment Setting available, so it can be mounted unconditionally.
 *
 * Applying and removing are single domain operations that also delete the
 * session paying the difference — its amount is fixed at creation, so once the
 * remainder moves that session is not stale but wrong.
 */
export function PaymentSettingGiftCard({ children, readonly }: Props): JSX.Element | null {
  const paymentsModel = usePaymentsModel()
  const state = usePaymentSessionsState()
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [isApplying, setIsApplying] = useState(false)
  // The shopper asks for the input again after the first card. It starts open
  // when nothing has been applied yet, which is the common case.
  const [inputRequested, setInputRequested] = useState(false)
  const [code, setCode] = useState("")

  const showInput = useCallback(() => {
    setInputRequested(true)
  }, [])

  const apply = useCallback(
    async (code: string): Promise<void> => {
      if (order == null || accessToken == null) return
      setErrors([])
      setIsApplying(true)
      try {
        await applyGiftCard({ accessToken, interceptors, order, giftCardCode: code })
        setCode("")
        setInputRequested(false)
        await getOrder(order.id)
      } catch (error) {
        setErrors([toGiftCardError(error)])
      } finally {
        setIsApplying(false)
      }
    },
    [accessToken, interceptors, order, getOrder]
  )

  const remove = useCallback(
    async (paymentSessionId: string): Promise<void> => {
      if (order == null || accessToken == null) return
      setErrors([])
      try {
        await removeGiftCard({ accessToken, interceptors, order, paymentSessionId })
        await getOrder(order.id)
      } catch (error) {
        setErrors([toGiftCardError(error)])
      }
    },
    [accessToken, interceptors, order, getOrder]
  )

  if (paymentsModel !== "payment_sessions" || state.giftCardSettingId == null) return null

  return (
    <PaymentSettingGiftCardContext.Provider
      value={{
        giftCardSessions: state.giftCardSessions,
        giftCardAmountCents: state.giftCardAmountCents,
        remainingAmountCents: state.remainingAmountCents,
        isCovered: state.isCovered,
        canAddGiftCard: state.canAddGiftCard,
        isInputVisible: state.giftCardSessions.length === 0 || inputRequested,
        showInput,
        isApplying,
        code,
        setCode,
        errors,
        applyGiftCard: apply,
        removeGiftCard: remove,
        readonly,
      }}
    >
      {children}
    </PaymentSettingGiftCardContext.Provider>
  )
}

/**
 * Both a code we recognise and the message the API sent.
 *
 * The API collapses four different causes — no such code, expired, empty, bound
 * to another market — into one message, so we cannot tell the shopper *why*.
 * A translated consumer keys off `code`; one that wants the detail shows
 * `message`.
 */
function toGiftCardError(error: unknown): BaseError {
  const message =
    error instanceof Error
      ? error.message
      : "This gift card code could not be applied to the order."
  return { code: "INVALID_FIELD_VALUE", resource: "gift_cards", field: "gift_card_code", message }
}

export default PaymentSettingGiftCard
