import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import type { PaymentResource } from "#reducers/PaymentMethodReducer"
import {
  type TSetExpressPlaceOrderParams,
  getAvailableExpressPayments,
  getExpressShippingMethods,
  setExpressFakeAddress,
  setExpressPlaceOrder,
  setExpressShippingMethod,
  expressRedirectUrl,
} from "#utils/expressPaymentHelper"
import { isEmpty } from "#utils/isEmpty"
import { PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js"
import type { PaymentRequest } from "@stripe/stripe-js"
import { useContext, useEffect, useState, type JSX } from "react"

interface Props {
  clientSecret: string
}

export function StripeExpressPayment({
  clientSecret,
}: Props): JSX.Element | null {
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<null | PaymentRequest>(
    null,
  )
  const { accessToken, endpoint } = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  const { paymentMethods, paymentSource } = useContext(PaymentMethodContext)

  useEffect(() => {
    if (stripe == null || order == null) {
      return
    }
    const pr = stripe.paymentRequest({
      country: order?.country_code ?? "US",
      currency: order?.currency_code?.toLowerCase() ?? "",
      total: {
        label: `#${order?.number ?? ""}`,
        amount: order?.total_amount_with_taxes_cents ?? 0,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
    })
    pr.canMakePayment()
      .then((result) => {
        if (result) {
          setPaymentRequest(pr)
        }
      })
      .catch((err) => {
        console.error("Can make payment:", err)
      })
  }, [isEmpty(stripe), isEmpty(order)])

  if (paymentRequest != null && stripe != null) {
    paymentRequest.on("shippingaddresschange", async (ev) => {
      if (order != null && accessToken != null && endpoint != null) {
        const requiresBillingInfo = order?.requires_billing_info ?? false
        const orderWithShipments = await setExpressFakeAddress({
          orderId: order.id,
          config: {
            accessToken,
            endpoint,
          },
          address: {
            first_name: "Fake name",
            last_name: "Fake lastname",
            country_code: ev.shippingAddress.country ?? "",
            line_1: "Fake street 123",
            city: ev.shippingAddress.city ?? "Fake city",
            zip_code: ev.shippingAddress.postalCode ?? "12345",
            state_code: ev.shippingAddress.region ?? "Fake state",
            phone: "1234567890",
            billing_info: requiresBillingInfo ? "Fake billing info" : undefined,
          },
        })
        const shippingOptions = getExpressShippingMethods(orderWithShipments)
        if (shippingOptions != null && !isEmpty(shippingOptions)) {
          ev.updateWith({
            status: "success",
            shippingOptions,
            total: {
              label: `#${orderWithShipments?.number ?? ""}`,
              amount: orderWithShipments?.total_amount_with_taxes_cents ?? 0,
            },
          })
        } else {
          ev.updateWith({
            status: "invalid_shipping_address",
          })
        }
      } else {
        ev.updateWith({
          status: "fail",
        })
      }
    })
    paymentRequest.on("shippingoptionchange", async (ev) => {
      if (order != null && accessToken != null && endpoint != null) {
        const updatedOrder = await setExpressShippingMethod({
          orderId: order.id,
          config: {
            accessToken,
            endpoint,
          },
          selectFirst: false,
          selectedShippingMethodId: ev.shippingOption.id,
          params: {
            include: ["shipments.available_shipping_methods"],
          },
        })
        ev.updateWith({
          status: "success",
          total: {
            label: `#${updatedOrder?.number ?? ""}`,
            amount: updatedOrder?.total_amount_with_taxes_cents ?? 0,
          },
        })
      } else {
        ev.updateWith({
          status: "fail",
        })
      }
    })
    paymentRequest.on("paymentmethod", async (ev) => {
      if (order?.id == null) throw new Error("Order is null")
      if (paymentMethods == null) throw new Error("Payment methods are null")
      const [paymentMethod] = getAvailableExpressPayments(paymentMethods)
      if (paymentMethod == null) throw new Error("Payment method is null")
      if (paymentSource == null) throw new Error("Payment source is null")
      const requiresBillingInfo = order?.requires_billing_info ?? false
      const paymentResource =
        paymentMethod?.payment_source_type as PaymentResource
      if (accessToken != null && endpoint != null) {
        const [firstName, lastName] = ev.payerName?.split(" ") ?? []
        const [line] = ev.shippingAddress?.addressLine ?? ""
        const email = ev.payerEmail ?? ""
        await setExpressFakeAddress({
          orderId: order.id,
          config: {
            accessToken,
            endpoint,
          },
          address: {
            first_name: firstName ?? "Fake name",
            last_name: lastName ?? "Fake lastname",
            country_code: ev?.shippingAddress?.country ?? "",
            line_1: line ?? "Fake street 123",
            city: ev?.shippingAddress?.city ?? "Fake city",
            zip_code: ev?.shippingAddress?.postalCode ?? "12345",
            state_code: ev?.shippingAddress?.region ?? "Fake state",
            phone: ev?.payerPhone ?? "1234567890",
            billing_info: requiresBillingInfo ? "Fake billing info" : undefined,
          },
          email,
        })
        await setExpressShippingMethod({
          orderId: order.id,
          config: {
            accessToken,
            endpoint,
          },
          selectFirst: false,
          selectedShippingMethodId: ev?.shippingOption?.id,
          params: {
            include: ["shipments.available_shipping_methods"],
          },
        })
        const placeOrderParams: TSetExpressPlaceOrderParams = {
          config: {
            accessToken,
            endpoint,
          },
          orderId: order?.id,
          paymentResource,
          paymentSourceId: paymentSource?.id,
        }
        await setExpressPlaceOrder(placeOrderParams)
        // Confirm the PaymentIntent without handling potential next actions (yet).
        const { paymentIntent, error: confirmError } =
          await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          )
        if (confirmError) {
          // Report to the browser that the payment failed, prompting it to
          // re-show the payment interface, or show an error message and close
          // the payment interface.
          ev.complete("fail")
          console.error("Confirm card payment:", confirmError)
        } else {
          // Report to the browser that the confirmation was successful, prompting
          // it to close the browser payment method collection interface.
          ev.complete("success")
          // Check if the PaymentIntent requires any actions and if so let Stripe.js
          // handle the flow. If using an API version older than "2019-02-11"
          // instead check for: `paymentIntent.status === "requires_source_action"`.
          if (paymentIntent.status === "requires_action") {
            // Let Stripe.js handle the rest of the payment flow.
            const { error } = await stripe.confirmCardPayment(clientSecret)
            if (error) {
              // The payment failed -- ask your customer for a new payment method.
              console.error("Confirm card payment:", error)
            } else {
              // The payment has succeeded.
              const placeOrderParams: TSetExpressPlaceOrderParams = {
                config: {
                  accessToken,
                  endpoint,
                },
                orderId: order?.id,
                placeTheOrder: true,
              }
              try {
                const order = await setExpressPlaceOrder(placeOrderParams)
                ev.complete("success")
                await expressRedirectUrl({
                  order,
                  config: {
                    accessToken,
                    endpoint,
                  },
                })
              } catch (err) {
                console.error("Place order:", err)
                ev.complete("fail")
              }
            }
          } else {
            // The payment has succeeded.
            const placeOrderParams: TSetExpressPlaceOrderParams = {
              config: {
                accessToken,
                endpoint,
              },
              orderId: order?.id,
              placeTheOrder: true,
            }
            try {
              const order = await setExpressPlaceOrder(placeOrderParams)
              ev.complete("success")
              await expressRedirectUrl({
                order,
                config: {
                  accessToken,
                  endpoint,
                },
              })
            } catch (err) {
              console.error("Place order:", err)
              ev.complete("fail")
            }
          }
        }
      }
    })
    return (
      <>
        <PaymentRequestButtonElement
          className=""
          options={{ paymentRequest }}
        />
      </>
    )
  }

  return null
}
