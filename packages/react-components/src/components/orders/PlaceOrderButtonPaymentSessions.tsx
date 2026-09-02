import {
  DEFAULT_PLACEABLE_ATTEMPTS,
  DEFAULT_PLACEABLE_INTERVAL_MS,
  placeOrderWithPaymentSessions,
} from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import { type JSX, type MouseEvent, type ReactNode, useContext, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import { useTermsAndConditions } from "#hooks/useTermsAndConditions"
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
 * **Placeability** cannot be read before clicking: `order.placeable` is
 * transient and never served on a GET, and it does not turn true until the
 * asynchronous authorization has succeeded — so using it as a gate would
 * disable the button precisely while payment is in progress. The truth arrives
 * after the click, from `_placeable`.
 *
 * **Whether anything is paying for the order**, on the other hand, is plain to
 * read from the order, and is gated here: without it a shopper who removes the
 * gift card that was covering the remainder — which deletes the session paying
 * the difference along with it — is left looking at a live button that can only
 * fail. The gate is the same derivation the rest of the payment UI uses, so the
 * button cannot disagree with the selector above it.
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
  const { isCovered, currentPaymentSession } = usePaymentSessionsState()
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [isLoading, setIsLoading] = useState(false)
  const organizationConfig = useOrganizationConfig({ accessToken })
  // The privacy and terms gate is a legal requirement of the checkout, not a
  // property of the payment model, so it applies here exactly as it does to the
  // older branch — same acceptance store, same "only when both URLs are
  // configured" rule as `placeOrderPermitted`.
  const { accepted: privacyTermsChecked } = useTermsAndConditions()

  const privacyUrl = order?.privacy_url ?? organizationConfig?.urls?.privacy
  const termsUrl = order?.terms_url ?? organizationConfig?.urls?.terms
  const privacyAccepted = privacyUrl && termsUrl ? privacyTermsChecked : true

  // Nothing left to pay is a complete answer: gift cards can cover an order
  // outright, and a free order has nothing to authorize. Otherwise the
  // difference needs its session.
  //
  // The zero test is strict on purpose. An order fetched without
  // `total_amount_with_taxes_cents` in its `fields` has `undefined` there, and
  // reading that as free would enable the button on an order nothing is paying
  // for — the same trap `isCovered` guards against with its `total > 0`.
  const isFree = order?.total_amount_with_taxes_cents === 0
  const isPaymentInPlace = isCovered || isFree || currentPaymentSession != null

  const handleClick = async (event?: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event?.preventDefault()
    event?.stopPropagation()
    if (order == null || accessToken == null || isLoading) return

    setIsLoading(true)
    setOrderErrors([])
    try {
      // The whole order goes in: which sessions get authorized, and in which
      // order — gift cards first, then the one paying the difference — is
      // domain knowledge that belongs with the sequence, not here.
      const result = await placeOrderWithPaymentSessions({
        accessToken,
        interceptors,
        order,
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

  const disabledButton =
    disabled !== undefined ? disabled : !privacyAccepted || !isPaymentInPlace
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
