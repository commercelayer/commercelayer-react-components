import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"
import PaymentGateway from "#components/payment_gateways/PaymentGateway"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"

// Stripe / single-payment-method / new-source flow: no payment source yet, one
// payment method, order.payment_source === null → the effect fires `setPaymentSource`.
function makeOrder() {
  return {
    id: "order-1",
    status: "pending",
    payment_method: { id: "pm-1", payment_source_type: "stripe_payments" },
    payment_source: null,
  }
}

const getCustomerPaymentSources = vi.fn()

function Tree({
  order,
  setPaymentSource,
}: {
  order: any
  setPaymentSource: (...args: any[]) => Promise<unknown>
}): ReactElement {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    <OrderContext.Provider value={{ order } as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
      <CustomerContext.Provider value={{ getCustomerPaymentSources } as any}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
        <PlaceOrderContext.Provider value={{ status: "" } as any}>
          <PaymentMethodChildrenContext.Provider
            value={
              {
                payment: { id: "pm-1", payment_source_type: "stripe_payments" },
                expressPayments: false,
                // biome-ignore lint/suspicious/noExplicitAny: test cast
              } as any
            }
          >
            <PaymentMethodContext.Provider
              value={
                {
                  currentPaymentMethodId: "pm-1",
                  currentPaymentMethodType: "stripe_payments",
                  config: null,
                  setPaymentSource,
                  paymentSource: null,
                  paymentMethods: [{ id: "pm-1" }],
                  errors: [],
                  // biome-ignore lint/suspicious/noExplicitAny: test cast
                } as any
              }
            >
              <PaymentGateway show showCard={false} handleEditClick={() => {}} />
            </PaymentMethodContext.Provider>
          </PaymentMethodChildrenContext.Provider>
        </PlaceOrderContext.Provider>
      </CustomerContext.Provider>
    </OrderContext.Provider>
  )
}

describe("PaymentGateway in-flight guard", () => {
  it("fires setPaymentSource only once when a non-essential dep changes mid-flight", () => {
    // A create that never settles: keeps the request "in flight" for the whole test.
    const setPaymentSource = vi.fn(() => new Promise<unknown>(() => {}))

    const order = makeOrder()
    const { rerender } = render(<Tree order={order} setPaymentSource={setPaymentSource} />)

    expect(setPaymentSource).toHaveBeenCalledTimes(1)

    // Re-render with a fresh `order` object (same data, new reference) — this is a
    // non-essential dependency change of the kind a parent re-render produces. The
    // effect re-runs while the first request is still in flight.
    rerender(<Tree order={{ ...order }} setPaymentSource={setPaymentSource} />)

    // Without the ref guard this would be 2. The guard bails on re-entry.
    expect(setPaymentSource).toHaveBeenCalledTimes(1)
  })
})
