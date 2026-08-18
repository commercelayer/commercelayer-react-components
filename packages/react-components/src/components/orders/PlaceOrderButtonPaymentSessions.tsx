import {
  DEFAULT_PLACEABLE_ATTEMPTS,
  DEFAULT_PLACEABLE_INTERVAL_MS,
  findCurrentPaymentSession,
  placeOrderWithPaymentSessions,
} from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import { type JSX, type MouseEvent, type ReactNode, useContext, useEffect, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { PLACE_ORDER_RECHECK_EVENT } from "#hooks/usePlaceOrder"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import { useOrganizationConfig } from "#utils/organization"

interface ChildrenProps extends Omit<Props, "children"> {
  handleClick: () => Promise<void>
  isLoading: boolean
}

interface Props extends Omit<JSX.IntrinsicElements["button"], "children" | "onClick"> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode | (() => ReactNode)
  loadingLabel?: string | ReactNode
  onClick?: (response: { placed: boolean; order?: Order; errors?: BaseError[] }) => void
  /**
   * Placeability attempts before the errors are shown to the shopper.
   * Defaults to 5. See `placeOrderWithPaymentSessions` for why retrying first
   * is the correct behaviour rather than an optimisation.
   */
  placeableAttempts?: number
  /** Delay between placeability attempts, in milliseconds. Defaults to 1000. */
  placeableIntervalMs?: number
}

/**
 * Place-order button for the `payment_sessions` model.
 *
 * Deliberately **not** a branch inside `PlaceOrderButtonPaymentSource`: that
 * component's enablement machine is built on `payment_method`,
 * `payment_source.payment_response`, `getCardDetails` and gateway `onsubmit`
 * refs, none of which exist here — and its upstream permission check hard-fails
 * every non-free order without a `payment_method`.
 *
 * The button stays **enabled**. Placeability cannot be read before clicking:
 * `order.placeable` is transient and never served on a GET, and it does not
 * turn true until the asynchronous authorization has succeeded — so using it as
 * a gate would disable the button precisely while payment is in progress. The
 * truth arrives after the click, from `_placeable`.
 */
export function PlaceOrderButtonPaymentSessions(props: Props): JSX.Element {
  const {
    children,
    label = "Place order",
    loadingLabel = "Placing...",
    disabled,
    onClick,
    placeableAttempts = DEFAULT_PLACEABLE_ATTEMPTS,
    placeableIntervalMs = DEFAULT_PLACEABLE_INTERVAL_MS,
    ...p
  } = props
  const { order, setOrderErrors, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [isLoading, setIsLoading] = useState(false)
  const organizationConfig = useOrganizationConfig({ accessToken })
  const [privacyTermsChecked, setPrivacyTermsChecked] = useState(
    () => localStorage.getItem("privacy-terms") === "true"
  )

  // The privacy and terms gate is a legal requirement of the checkout, not a
  // property of the payment model, so it applies here exactly as it does to the
  // older branch — same storage key, same "only when both URLs are configured"
  // rule as `placeOrderPermitted`.
  //
  // `<PrivacyAndTermsCheckbox>` announces changes through a DOM event rather
  // than context, so there is nothing to read: we listen for the same event the
  // older branch listens for.
  useEffect(() => {
    const recheck = (): void => {
      setPrivacyTermsChecked(localStorage.getItem("privacy-terms") === "true")
    }
    window.addEventListener(PLACE_ORDER_RECHECK_EVENT, recheck)
    return () => {
      window.removeEventListener(PLACE_ORDER_RECHECK_EVENT, recheck)
    }
  }, [])

  const privacyUrl = order?.privacy_url ?? organizationConfig?.urls?.privacy
  const termsUrl = order?.terms_url ?? organizationConfig?.urls?.terms
  const privacyAccepted = privacyUrl && termsUrl ? privacyTermsChecked : true

  const handleClick = async (event?: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event?.preventDefault()
    event?.stopPropagation()
    if (order == null || accessToken == null || isLoading) return

    setIsLoading(true)
    setOrderErrors([])
    try {
      // The Current Payment Session is searched for, never read positionally:
      // abandoned attempts leave inert sessions behind, and switching setting
      // leaves the previous one in the same array.
      const paymentSession = findCurrentPaymentSession({
        paymentSessions: order.payment_sessions,
      })

      const result = await placeOrderWithPaymentSessions({
        accessToken,
        interceptors,
        orderId: order.id,
        paymentSession,
        attempts: placeableAttempts,
        intervalMs: placeableIntervalMs,
      })

      if (result.placed) {
        onClick?.({ placed: true, order: result.order })
        return
      }

      const errors: BaseError[] = result.errors.map((error) => ({
        code: "VALIDATION_ERROR",
        resource: "orders",
        message: error.message,
        field: error.field,
        ...(error.meta != null ? { meta: error.meta } : {}),
      }))
      setOrderErrors(errors)
      onClick?.({ placed: false, order: result.order, errors })
      // The order moved on without us — an authorization may have landed, or
      // auto_place may have fired — so pull the truth back in rather than
      // leaving the shopper looking at stale amounts.
      await getOrder(order.id)
    } catch (error) {
      const errors: BaseError[] = [
        {
          code: "VALIDATION_ERROR",
          resource: "orders",
          message: error instanceof Error ? error.message : "The order could not be placed.",
        },
      ]
      setOrderErrors(errors)
      onClick?.({ placed: false, errors })
    } finally {
      setIsLoading(false)
    }
  }

  const disabledButton = disabled !== undefined ? disabled : !privacyAccepted
  const labelButton = isLoading ? loadingLabel : typeof label === "function" ? label() : label

  return children ? (
    <Parent {...{ ...props, disabled: disabledButton, handleClick, isLoading }}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={disabledButton || isLoading}
      onClick={(event) => {
        void handleClick(event)
      }}
      {...p}
    >
      {labelButton}
    </button>
  )
}

export default PlaceOrderButtonPaymentSessions
