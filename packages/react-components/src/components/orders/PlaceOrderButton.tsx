import type { Order } from "@commercelayer/sdk"
import type { JSX, ReactNode } from "react"
import Parent from "#components/utils/Parent"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { PlaceOrderOptions } from "#reducers/PlaceOrderReducer"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import { PlaceOrderButtonPaymentSessions } from "./PlaceOrderButtonPaymentSessions"
import { PlaceOrderButtonPaymentSource } from "./PlaceOrderButtonPaymentSource"

interface ChildrenProps extends Omit<Props, "children"> {
  handleClick: () => Promise<void>
}

interface Props extends Omit<JSX.IntrinsicElements["button"], "children" | "onClick"> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode | (() => ReactNode)
  loadingLabel?: string | ReactNode
  /** `payment_source` model only — the new model has no redirect flows yet. */
  autoPlaceOrder?: boolean
  onClick?: (response: { placed: boolean; order?: Order; errors?: BaseError[] }) => void
  /**
   * Redirect-flow options (PayPal, Adyen, Stripe, Checkout.com).
   * Meaningful on the `payment_source` model only, and forwarded only there.
   */
  options?: PlaceOrderOptions
  /** `payment_sessions` model only. Placeability attempts. Defaults to 5. */
  placeableAttempts?: number
  /** `payment_sessions` model only. Delay between attempts in ms. Defaults to 1000. */
  placeableIntervalMs?: number
}

/**
 * Places the order, choosing the implementation that matches the order's
 * Payments Model.
 *
 * This component exists so that the split is invisible to consumers: an
 * application already mounting `<PlaceOrderButton>` keeps working unchanged,
 * whichever model its orders are on. The two implementations behind it share
 * almost nothing — see
 * `docs/adr/2026-08-18-place-order-split-by-payments-model.md`.
 *
 * Mount `<PlaceOrderButtonPaymentSource>` or
 * `<PlaceOrderButtonPaymentSessions>` directly to skip the routing when an
 * application only ever sees one model.
 */
export function PlaceOrderButton(props: Props): JSX.Element {
  const paymentsModel = usePaymentsModel()
  const {
    children,
    label = "Place order",
    loadingLabel = "Placing...",
    autoPlaceOrder,
    options,
    placeableAttempts,
    placeableIntervalMs,
    disabled,
    onClick,
    ...p
  } = props

  switch (paymentsModel) {
    case "payment_source":
      return (
        <PlaceOrderButtonPaymentSource
          {...p}
          label={label}
          loadingLabel={loadingLabel}
          autoPlaceOrder={autoPlaceOrder}
          options={options}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </PlaceOrderButtonPaymentSource>
      )
    case "payment_sessions":
      return (
        <PlaceOrderButtonPaymentSessions
          {...p}
          label={label}
          loadingLabel={loadingLabel}
          placeableAttempts={placeableAttempts}
          placeableIntervalMs={placeableIntervalMs}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </PlaceOrderButtonPaymentSessions>
      )
    default: {
      // The model is not knowable until the order has loaded. Render an inert
      // button rather than delegating or hiding: mounting the `payment_source`
      // branch would start five redirect effects that read a payment source
      // this order may not have, and rendering `null` would make the button
      // appear late — a visible change for applications upgrading, even though
      // the mount hierarchy is identical.
      const labelButton = typeof label === "function" ? label() : label
      const handleClick = async (): Promise<void> => undefined
      return children ? (
        <Parent {...{ ...props, disabled: true, handleClick }}>{children}</Parent>
      ) : (
        <button type="button" disabled {...p}>
          {labelButton}
        </button>
      )
    }
  }
}

export default PlaceOrderButton
