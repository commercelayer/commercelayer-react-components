import type { Order } from "@commercelayer/sdk"
import type { JSX, ReactNode } from "react"
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
 * almost nothing.
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

  // `payment_sessions` is the only model that can be recognised on the first
  // fetch — `available_payment_settings` is included for every order — so it is
  // the only one that needs its own branch. Everything else, `undetermined`
  // included, gets the `payment_source` button, and gets it **from the start**.
  //
  // Not an inert placeholder while undetermined, although that was the first
  // design. The `payment_source` button owns the place-order state: without a
  // container above it, it is what registers the shipment and address includes
  // and works out whether placing is permitted. An order on the older model
  // stays undetermined until the payment step asks for its methods, so a
  // placeholder there left the delivery step without its shipping methods and
  // the checkout stuck before payment. Mounted early, it behaves exactly as it
  // did before the split; its redirect effects wait for an order and a payment
  // source like they always have, and an order that turns out to be on the
  // newer model swaps it out as soon as it loads.
  if (paymentsModel === "payment_sessions") {
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
  }
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
}

export default PlaceOrderButton
