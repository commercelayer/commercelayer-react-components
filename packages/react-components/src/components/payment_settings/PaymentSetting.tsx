import {
  createPaymentSession,
  findCurrentPaymentSession,
  findReusablePaymentSession,
  GIFT_CARD_SETTING_TYPE,
} from "@commercelayer/core-components"
import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useEffect, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { BaseError } from "#typings/errors"

/**
 * Payment Setting types this library can drive today.
 *
 * Anything not listed is skipped entirely rather than rendered inert: a radio
 * button for a setting with no implementation behind it does nothing when
 * clicked, which is worse for the shopper than not offering it.
 *
 * The goal is to cover all six. See the implementation table in
 * `docs/adr/2026-08-18-payment-session-lifecycle.md`.
 */
const IMPLEMENTED_SETTING_TYPES = ["payment_setting_manuals"] as const

export interface PaymentSettingOnSelectParams {
  setting: PaymentSettingResource
  /** The order as refetched after the selection was stored. */
  order?: Order
  /** The Payment Session backing the selection. */
  paymentSession?: PaymentSession
}

interface Props {
  children?: ReactNode
  /**
   * Show what was chosen without letting it change — a placed order, for
   * instance. Renders only the selected setting, and keeps rendering it even
   * once nothing is left to pay.
   */
  readonly?: boolean
  /**
   * Fired once the selection has been stored and the order refetched — not on
   * click. The counterpart of `<PaymentMethod>`'s `onClick`.
   *
   * Keep the identity stable (`useCallback`): it is read during the selection
   * handler, and an unstable one is the usual route to a render loop here.
   */
  onSelect?: (params: PaymentSettingOnSelectParams) => void
}

/**
 * Iterate the order's `available_payment_settings` and render `children` once
 * per setting, with that setting in context.
 *
 * Renders nothing unless the order is on the `payment_sessions` model, so it
 * can be mounted alongside `<PaymentMethod>` without a coordinator above: each
 * tree silently steps aside when the order is not its own.
 */
export function PaymentSetting({ children, onSelect, readonly }: Props): JSX.Element | null {
  const paymentsModel = usePaymentsModel()
  const { isCovered, remainingAmountCents } = usePaymentSessionsState()
  const { order, include, includeLoaded, addResourceToInclude, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [pendingSettingId, setPendingSettingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<BaseError[]>([])

  // Reading a selection back needs the session's setting; telling a reusable
  // session from a burnt one needs its authorization. Registered here rather
  // than globally: two levels of nesting on a collection is the expensive part
  // of the payload, and only this subtree needs it.
  useEffect(() => {
    const needed = [
      "payment_sessions.payment_setting",
      "payment_sessions.payment_authorization",
    ] as const
    if (!needed.every((resource) => include?.includes(resource))) {
      addResourceToInclude({ newResource: [...needed] })
    } else if (needed.some((resource) => includeLoaded?.[resource] !== true)) {
      addResourceToInclude({
        newResourceLoaded: {
          "payment_sessions.payment_setting": true,
          "payment_sessions.payment_authorization": true,
        },
      })
    }
  }, [include, includeLoaded, addResourceToInclude])

  if (paymentsModel !== "payment_sessions" || order == null) return null

  // Nothing left to pay means nothing to choose. Gift cards can cover an order
  // outright, and offering a payment method then is not merely redundant:
  // creating that session fails with a 422 about `amount_cents` having to be
  // greater than zero, which is not something a shopper can act on.
  //
  // Readonly is exempt — a placed order is covered by definition, and hiding
  // what was used is the opposite of the point.
  if (readonly !== true && isCovered) return null

  const settings = (order.available_payment_settings ?? []).filter((setting) => {
    // Gift cards are handled by <PaymentSettingGiftCard>, not here: they are
    // additive rather than one of the alternatives this group picks between.
    // Skipped silently — they are implemented, just elsewhere.
    if (setting.type === GIFT_CARD_SETTING_TYPE) return false

    const implemented = IMPLEMENTED_SETTING_TYPES.includes(
      setting.type as (typeof IMPLEMENTED_SETTING_TYPES)[number]
    )
    if (!implemented && process.env.NODE_ENV !== "production") {
      // Without this, an organization whose only configured settings are
      // unimplemented gets a checkout with no payment options and no clue why.
      console.warn(
        `[commercelayer] <PaymentSetting> skipped "${setting.type}": not implemented yet.`
      )
    }
    return implemented
  })

  const selectSetting = async (setting: PaymentSettingResource): Promise<void> => {
    if (accessToken == null || order == null) return
    setErrors([])
    setPendingSettingId(setting.id)
    try {
      // Reuse before creating. `amount_cents` is immutable, so there is no
      // "update the existing session" path — without this, every remount or
      // refetch that re-runs the click handler would leave another session
      // behind. Reuse is also what makes a page refresh resume the selection
      // instead of duplicating it.
      const reusable = findReusablePaymentSession({
        paymentSessions: order.payment_sessions,
        paymentSettingId: setting.id,
        amountCents: remainingAmountCents,
      })
      if (reusable == null) {
        await createPaymentSession({
          accessToken,
          interceptors,
          orderId: order.id,
          paymentSettingId: setting.id,
          // The remainder after the gift cards, which the server cannot work
          // out for itself until they are authorized at place time.
          amountCents: remainingAmountCents,
        })
      }
      const refreshed = await getOrder(order.id)
      onSelect?.({
        setting,
        order: refreshed,
        paymentSession: findCurrentPaymentSession({
          paymentSessions: refreshed?.payment_sessions ?? order.payment_sessions,
          paymentSettingId: setting.id,
        }),
      })
    } catch (error) {
      setErrors([
        {
          code: "VALIDATION_ERROR",
          resource: "payment_methods",
          message:
            error instanceof Error ? error.message : "The payment method could not be selected.",
        },
      ])
    } finally {
      setPendingSettingId(null)
    }
  }

  // One selection for the whole order, not one per setting. Switching setting
  // leaves the previous session behind — it is inert and may not be deletable
  // with a sales-channel token — so without this every setting the shopper has
  // tried would render as selected at the same time.
  const selectedSession = findCurrentPaymentSession({ paymentSessions: order.payment_sessions })

  return (
    <>
      {settings
        .filter(
          (setting) => readonly !== true || selectedSession?.payment_setting?.id === setting.id
        )
        .map((setting) => {
          const isSelected = selectedSession?.payment_setting?.id === setting.id
          const currentPaymentSession = isSelected ? selectedSession : undefined
          return (
            <PaymentSettingChildrenContext.Provider
              key={setting.id}
              value={{
                setting,
                currentPaymentSession,
                isSelected,
                isPending: pendingSettingId === setting.id,
                errors,
                readonly,
                selectSetting: async () => {
                  await selectSetting(setting)
                },
              }}
            >
              {children}
            </PaymentSettingChildrenContext.Provider>
          )
        })}
    </>
  )
}

export default PaymentSetting
