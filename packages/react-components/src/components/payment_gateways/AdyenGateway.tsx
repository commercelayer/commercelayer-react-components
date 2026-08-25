import type { StripeElementLocale } from "@stripe/stripe-js"
import { type JSX, useContext, useRef } from "react"
import type { GatewayBaseType } from "#components/payment_gateways/PaymentGateway"
import AdyenPayment from "#components/payment_source/AdyenPayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PaymentSourceContext from "#context/PaymentSourceContext"
import type { PaymentResource } from "#reducers/PaymentMethodReducer"
import getCardDetails from "#utils/getCardDetails"
import { getPaymentAttributes } from "#utils/getPaymentAttributes"
import { hasSubscriptions } from "#utils/hasSubscriptions"
import { isEmpty } from "#utils/isEmpty"
import { jwt } from "#utils/jwt"
import PaymentCardsTemplate from "../utils/PaymentCardsTemplate"

type Props = GatewayBaseType

export function AdyenGateway(props: Props): JSX.Element | null {
  const {
    readonly,
    showCard,
    handleEditClick,
    children,
    templateCustomerCards,
    templateCustomerSaveToWallet,
    ...p
  } = props
  const { order } = useContext(OrderContext)
  const { accessToken } = useContext(CommerceLayerContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } = useContext(PaymentMethodContext)
  // Identity of the Adyen session the Drop-in was built from. Nothing in the options
  // handed to `AdyenCheckout` is a session token: the instance is assembled from
  // `paymentMethodsResponse` and from `amount`, which comes straight off
  // `order.total_amount_with_taxes_cents`. So the session goes stale in two ways — the
  // payment source is replaced, or the order total moves under a source that keeps its
  // id, which is what applying or removing a coupon does. Either way the instance on
  // screen is still talking to something the API has moved past, and only a remount
  // fixes it.
  //
  // A `key` says that without touching the `checkout` latch in AdyenPayment, and without
  // the host having to unmount the component to get the same effect — which is how
  // mfe-checkout used to get it, by accident, through `accordionCtx.isActive &&`.
  //
  // The key only advances on a *ready* source. A replacement is created empty and filled
  // a moment later, so keying on the id alone would yield a Drop-in with no payment
  // methods (AdyenPayment.tsx:174-176). Until it is ready the old instance stays up,
  // which is still more use than a new empty one.
  //
  // A partial authorization does NOT move the order total — there it is the remaining
  // amount that changes, refreshed in place by
  // `checkoutRef.update({ amount }, { shouldReinitializeCheckout: true })` in
  // AdyenPayment. The two signals are disjoint, so this key does not tread on that path.
  const readyAdyenSessionKey = useRef<string | null>(null)
  const availablePaymentMethodsCount: number =
    // @ts-expect-error no type
    paymentSource?.payment_methods?.paymentMethods?.length ?? 0
  if (paymentSource?.id != null && availablePaymentMethodsCount > 0) {
    readyAdyenSessionKey.current = `${paymentSource.id}:${order?.total_amount_with_taxes_cents ?? 0}`
  }
  const adyenSessionKey = readyAdyenSessionKey.current ?? undefined
  const paymentResource: PaymentResource = "adyen_payments"
  const locale = order?.language_code as StripeElementLocale
  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error no type
  const clientKey = paymentSource?.public_key
  const environment = accessToken && jwt(accessToken).test ? "test" : "live"
  const adyenConfig = getPaymentAttributes({
    resource: paymentResource,
    config: config ?? {},
    keys: ["adyen_payments"],
  })
  const paymentConfig = adyenConfig?.adyenPayment
  let customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return (
            customerPayment.payment_source?.type === "adyen_payments" ||
            customerPayment.payment_method != null
          )
        })
      : []
  if (readonly || showCard) {
    const card = getCardDetails({
      customerPayment: {
        payment_source: paymentSource,
      },
      paymentType: paymentResource,
    })
    const value = { ...card, showCard, handleEditClick, readonly }
    return isEmpty(card) ? null : (
      <PaymentSourceContext.Provider value={value}>{children}</PaymentSourceContext.Provider>
    )
  }
  let hasStoredPaymentMethods =
    // @ts-expect-error missing type
    paymentSource?.payment_methods?.storedPaymentMethods != null &&
    // @ts-expect-error missing type
    paymentSource?.payment_methods?.storedPaymentMethods.length > 0
  if (order && hasSubscriptions(order)) {
    /**
     * When the order has subscriptions, we do not show stored payment methods
     */
    hasStoredPaymentMethods = false
    customerPayments = []
  }
  if (!isGuest && templateCustomerCards) {
    return (
      <>
        {hasStoredPaymentMethods || isEmpty(customerPayments) ? null : (
          <div className={p.className}>
            <PaymentCardsTemplate {...{ paymentResource, customerPayments }}>
              {templateCustomerCards}
            </PaymentCardsTemplate>
          </div>
        )}
        <AdyenPayment
          key={adyenSessionKey}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          clientKey={clientKey}
          locale={locale}
          environment={environment}
          config={paymentConfig}
        />
      </>
    )
  }
  return (
    <AdyenPayment
      key={adyenSessionKey}
      clientKey={clientKey}
      locale={locale}
      config={paymentConfig}
      environment={environment}
    />
  )
}

export default AdyenGateway
