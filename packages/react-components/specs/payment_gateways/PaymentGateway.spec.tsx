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

// Single-payment-method order whose existing source no longer matches the total
// (e.g. a coupon lowered it): `payment_source.mismatched_amounts === true`. This is
// the #803 shape that used to loop.
function makeMismatchedOrder() {
  return {
    id: "order-1",
    status: "pending",
    payment_method: { id: "pm-1", payment_source_type: "stripe_payments" },
    payment_source: { id: "ps-1", mismatched_amounts: true },
  }
}

// Same order once the source has been recreated for the current total.
function makeSettledOrder() {
  return {
    id: "order-1",
    status: "pending",
    payment_method: { id: "pm-1", payment_source_type: "stripe_payments" },
    payment_source: { id: "ps-2", mismatched_amounts: false },
  }
}

const noopGetCustomerPaymentSources = vi.fn()

function Tree({
  order,
  setPaymentSource,
  paymentSource = null,
  paymentMethods = [{ id: "pm-1" }],
  errors = [],
  getCustomerPaymentSources = noopGetCustomerPaymentSources,
}: {
  order: any
  setPaymentSource: (...args: any[]) => Promise<unknown>
  paymentSource?: any
  paymentMethods?: any
  errors?: any
  getCustomerPaymentSources?: (...args: any[]) => unknown
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
                  paymentSource,
                  paymentMethods,
                  errors,
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

// Regression coverage for #803: a single-payment-method order whose existing source is
// mismatched used to spin forever (recreate nothing → refetch → new identities → repeat).
describe("PaymentGateway single-method mismatched source (#803)", () => {
  it("recreates the source when a single-method order's source is mismatched", () => {
    const setPaymentSource = vi.fn(() => new Promise<unknown>(() => {}))

    render(
      <Tree
        order={makeMismatchedOrder()}
        setPaymentSource={setPaymentSource}
        // The context source is mismatched too — this is what invokes the reconcile pass.
        paymentSource={{ id: "ps-1", type: "stripe_payments", mismatched_amounts: true }}
      />
    )

    // Before the fix the single-method branch matched neither condition and never
    // recreated; now the mismatched source is genuinely recreated.
    expect(setPaymentSource).toHaveBeenCalledTimes(1)
  })

  it("does not recreate a settled single-method source", () => {
    const setPaymentSource = vi.fn(() => new Promise<unknown>(() => {}))

    render(
      <Tree
        order={makeSettledOrder()}
        setPaymentSource={setPaymentSource}
        paymentSource={{ id: "ps-2", type: "stripe_payments", mismatched_amounts: false }}
      />
    )

    // Source is present, matches, and is not mismatched → nothing to recreate. This is
    // the settled state the loop must converge to.
    expect(setPaymentSource).not.toHaveBeenCalled()
  })

  it("does not refetch customer sources on a no-op reconcile pass", () => {
    const setPaymentSource = vi.fn(() => new Promise<unknown>(() => {}))
    const getCustomerPaymentSources = vi.fn()

    render(
      <Tree
        order={makeSettledOrder()}
        setPaymentSource={setPaymentSource}
        // Context source flags mismatched (invoking the reconcile pass) while the order's
        // source is already settled — the exact no-op pass that used to re-arm the effect.
        paymentSource={{ id: "ps-2", type: "stripe_payments", mismatched_amounts: true }}
        getCustomerPaymentSources={getCustomerPaymentSources}
      />
    )

    // Nothing was recreated, so the customer-sources refetch — the loop's engine — must
    // not fire (Hardening #1).
    expect(setPaymentSource).not.toHaveBeenCalled()
    expect(getCustomerPaymentSources).not.toHaveBeenCalled()
  })
})
