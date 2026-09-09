import {
  createPaymentSession,
  discardPaymentSession,
  findCurrentPaymentSession,
  findReusablePaymentSession,
  GIFT_CARD_SETTING_TYPE,
  hasLiveAuthorization,
} from "@commercelayer/core-components"
import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useEffect, useRef, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { useAdyenRedirectResume } from "#hooks/useAdyenRedirectResume"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import { useStripeRedirectResume } from "#hooks/useStripeRedirectResume"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import {
  paymentSettingCreateAttributes,
  paymentSettingUnusableReason,
} from "#utils/paymentSettingCreateAttributes"

/**
 * Payment Setting types this library can drive today.
 *
 * Anything not listed is skipped entirely rather than rendered inert: a radio
 * button for a setting with no implementation behind it does nothing when
 * clicked, which is worse for the shopper than not offering it.
 *
 * The goal is to cover all six.
 */
const IMPLEMENTED_SETTING_TYPES = [
  "payment_setting_manuals",
  "payment_setting_adyens",
  "payment_setting_stripes",
] as const

export interface PaymentSettingOnSelectParams {
  setting: PaymentSettingResource
  /** The order as refetched after the selection was stored. */
  order?: Order
  /** The Payment Session backing the selection. */
  paymentSession?: PaymentSession
}

/**
 * The state of the setting currently being rendered.
 *
 * Given to `children` when it is a function, so an application can style the
 * chosen option — a highlighted card, say — or make the whole card the click
 * target instead of just the radio. Reading the same state off
 * `<PaymentSettingRadioButton>`'s render prop only reaches inside the control.
 */
export interface PaymentSettingChildrenProps {
  setting: PaymentSettingResource
  /** Whether this setting is the shopper's current choice. */
  isSelected: boolean
  /** Whether its Payment Session is being created right now. */
  isPending: boolean
  /** The Payment Session backing the selection, once it exists. */
  currentPaymentSession?: PaymentSession
  /** Why the last selection failed, if it did. */
  errors: BaseError[]
  /**
   * Choose this setting. The same call the radio makes, so an application can
   * put it on the whole card — a second call while one is in flight is
   * ignored, so wrapping the radio does not create two Payment Sessions.
   */
  selectSetting: () => Promise<void>
}

interface Props {
  /**
   * Markup rendered once per available setting, or a function receiving that
   * setting's state.
   */
  children?: ReactNode | ChildrenFunction<PaymentSettingChildrenProps>
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
  /**
   * Where a gateway should send the shopper back to after a redirect — a 3DS
   * challenge on its own page, most often.
   *
   * Defaults to the current location, cleaned of the parameters a previous
   * redirect left behind. Pass it when that URL is not one this application can
   * reload as it stands, or when it is too long: from gateway version 72 Adyen
   * refuses a `returnUrl` over 1024 characters, and a checkout carrying an
   * access token in its query string can exceed that on the token alone. The
   * usual answer is the same URL without the credentials, with the return
   * re-authenticated from storage.
   *
   * Read when the session is created, which is when the radio is clicked, so it
   * has to be here rather than on a gateway component: the selection *is* the
   * session, and deferring creation to a child would leave nothing for the
   * radio to read back.
   */
  returnUrl?: string
}

/**
 * Iterate the order's `available_payment_settings` and render `children` once
 * per setting, with that setting in context.
 *
 * Renders nothing unless the order is on the `payment_sessions` model, so it
 * can be mounted alongside `<PaymentMethod>` without a coordinator above: each
 * tree silently steps aside when the order is not its own.
 */
export function PaymentSetting({
  children,
  onSelect,
  readonly,
  returnUrl,
}: Props): JSX.Element | null {
  const paymentsModel = usePaymentsModel()
  const { isCovered, remainingAmountCents } = usePaymentSessionsState()
  const { order, include, includeLoaded, addResourceToInclude, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [pendingSettingId, setPendingSettingId] = useState<string | null>(null)
  // Read synchronously, unlike `pendingSettingId`. One click can reach the
  // handler twice — a card wired to `selectSetting` with the radio inside it —
  // and both reads of the state variable would still say "idle", leaving two
  // Payment Sessions behind for a single click.
  const selectionInFlight = useRef(false)
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

  // Finishing a redirect needs no UI — Adyen's `submitDetails` and Stripe's
  // `retrievePaymentIntent` are both plain calls — so it runs from here, the one
  // component the Payment Session lifecycle requires to stay mounted. Inside a
  // gateway component it would depend on which checkout step the application
  // happens to render, and an accordion that came back collapsed would leave a
  // charged card on an unplaced order.
  //
  // Both are called unconditionally, as hooks must be, and each does nothing
  // unless its own gateway's return parameters are in the URL. They cannot both
  // fire: a return carries one gateway's parameters.
  useAdyenRedirectResume()
  useStripeRedirectResume()

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
    if (!implemented) {
      if (process.env.NODE_ENV !== "production") {
        // Without this, an organization whose only configured settings are
        // unimplemented gets a checkout with no payment options and no clue why.
        console.warn(
          `[commercelayer] <PaymentSetting> skipped "${setting.type}": not implemented yet.`
        )
      }
      return false
    }

    // Implemented, but not usable on this order: switched off, or missing the
    // credential its gateway UI needs. Skipped for the same reason an
    // unimplemented type is — a radio button that does nothing when clicked is
    // worse than no radio button — and from the shopper's side the two cases
    // are indistinguishable anyway.
    const unusable = paymentSettingUnusableReason(setting)
    if (unusable != null) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[commercelayer] <PaymentSetting> skipped "${setting.type}": ${unusable}.`)
      }
      return false
    }

    return true
  })

  const selectSetting = async (setting: PaymentSettingResource): Promise<void> => {
    if (accessToken == null || order == null) return
    if (selectionInFlight.current) return
    selectionInFlight.current = true
    setErrors([])
    setPendingSettingId(setting.id)
    try {
      // Reuse before creating. `amount_cents` is immutable, so there is no
      // "update the existing session" path — without this, every remount or
      // refetch that re-runs the click handler would leave another session
      // behind. Reuse is also what makes a page refresh resume the selection
      // instead of duplicating it.
      // Read before anything changes: whatever the shopper is switching *away*
      // from, so it can be cleared once the new selection is in place.
      const superseded = findCurrentPaymentSession({
        paymentSessions: order.payment_sessions,
      })

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
          // Whatever this setting's gateway needs to know at creation. For
          // Adyen that is the `return_url` its session is built with, and the
          // tokenization variant — neither of which can be added later.
          ...paymentSettingCreateAttributes({ setting, accessToken, returnUrl }),
        })
      }
      // Clear the session the shopper just left, so the order carries one
      // selection rather than a trail of every setting they tried.
      //
      // **After** the new one exists, never before: the selection is the newest
      // session, so creating first means it is already correct when this runs,
      // and a delete that fails leaves a state the library handles rather than
      // an order with nothing selected. Failures are swallowed for the same
      // reason — `findCurrentPaymentSession` picks the newest either way, so
      // this is tidying, not correctness.
      //
      // Skipped when the session was adopted rather than created: there is
      // nothing to supersede, and deleting it would delete the selection.
      // Skipped too for anything holding money — a gift card is never the
      // current selection, and one carrying a live authorization is not ours to
      // undo here. The rule throughout is that sessions which took no money
      // are deleted and everything else is abandoned.
      if (
        superseded != null &&
        superseded.payment_setting?.id !== setting.id &&
        !hasLiveAuthorization(superseded)
      ) {
        // Its own try: `discardPaymentSession` swallows its failures already,
        // but a rejection escaping here would land in the catch below and turn
        // a selection that in fact succeeded into a reported error — and skip
        // the refetch that makes it visible.
        try {
          await discardPaymentSession({
            accessToken,
            interceptors,
            paymentSessionId: superseded.id,
          })
        } catch {
          // Nothing to report: the newest session is the selection regardless.
        }
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
      selectionInFlight.current = false
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
          const select = async (): Promise<void> => {
            await selectSetting(setting)
          }
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
                returnUrl,
                selectSetting: select,
              }}
            >
              {typeof children === "function"
                ? children({
                    setting,
                    isSelected,
                    isPending: pendingSettingId === setting.id,
                    currentPaymentSession,
                    errors,
                    selectSetting: select,
                  })
                : children}
            </PaymentSettingChildrenContext.Provider>
          )
        })}
    </>
  )
}

export default PaymentSetting
