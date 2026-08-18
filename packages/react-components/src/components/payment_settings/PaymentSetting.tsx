import {
  createPaymentSession,
  findCurrentPaymentSession,
  findReusablePaymentSession,
} from "@commercelayer/core-components"
import type { PaymentSetting as PaymentSettingResource } from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useEffect, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
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

interface Props {
  children?: ReactNode
}

/**
 * Iterate the order's `available_payment_settings` and render `children` once
 * per setting, with that setting in context.
 *
 * Renders nothing unless the order is on the `payment_sessions` model, so it
 * can be mounted alongside `<PaymentMethod>` without a coordinator above: each
 * tree silently steps aside when the order is not its own.
 */
export function PaymentSetting({ children }: Props): JSX.Element | null {
  const paymentsModel = usePaymentsModel()
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

  const settings = (order.available_payment_settings ?? []).filter((setting) => {
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
      })
      if (reusable == null) {
        await createPaymentSession({
          accessToken,
          interceptors,
          orderId: order.id,
          paymentSettingId: setting.id,
        })
      }
      await getOrder(order.id)
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
      {settings.map((setting) => {
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
