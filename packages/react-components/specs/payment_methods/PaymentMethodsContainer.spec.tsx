import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethodsContainer } from "#components/payment_methods/PaymentMethodsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import CustomerContext from "#context/CustomerContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"

// biome-ignore lint/suspicious/noExplicitAny: test cast
const MOCK_ORDER: any = {
  id: "order-1",
  status: "pending",
  available_payment_methods: [
    { id: "pm_stripe", payment_source_type: "stripe_payments", name: "Stripe" },
  ],
  payment_method: null,
  payment_source: null,
}

function Providers({
  children,
  order = MOCK_ORDER,
  addResourceToInclude = vi.fn(),
}: {
  children: ReactNode
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  order?: any
  addResourceToInclude?: ReturnType<typeof vi.fn>
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          orderId: "order-1",
          order,
          addResourceToInclude,
          getOrder: vi.fn().mockResolvedValue(order),
        }}
      >
        <CustomerContext.Provider value={{}}>
          <PlaceOrderContext.Provider value={defaultPlaceOrderContext}>
            {children}
          </PlaceOrderContext.Provider>
        </CustomerContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("PaymentMethodsContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children", () => {
    render(
      <Providers>
        <PaymentMethodsContainer>
          <span data-testid="child">content</span>
        </PaymentMethodsContainer>
      </Providers>
    )
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("provides _isProvided: true in PaymentMethodContext", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    let capturedCtx: any = null

    function Consumer() {
      capturedCtx = useContext(PaymentMethodContext)
      return null
    }

    render(
      <Providers>
        <PaymentMethodsContainer>
          <Consumer />
        </PaymentMethodsContainer>
      </Providers>
    )

    expect(capturedCtx._isProvided).toBe(true)
  })

  it("populates paymentMethods in context from order available_payment_methods", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    let capturedCtx: any = null

    function Consumer() {
      capturedCtx = useContext(PaymentMethodContext)
      return null
    }

    await act(async () => {
      render(
        <Providers>
          <PaymentMethodsContainer>
            <Consumer />
          </PaymentMethodsContainer>
        </Providers>
      )
    })

    expect(capturedCtx.paymentMethods).toEqual(MOCK_ORDER.available_payment_methods)
  })

  it("calls addResourceToInclude with payment-related resources on mount", async () => {
    const addResourceToInclude = vi.fn()

    await act(async () => {
      render(
        <Providers addResourceToInclude={addResourceToInclude}>
          <PaymentMethodsContainer>
            <span />
          </PaymentMethodsContainer>
        </Providers>
      )
    })

    expect(addResourceToInclude).toHaveBeenCalledWith(
      expect.objectContaining({
        newResource: expect.arrayContaining(["available_payment_methods", "payment_source"]),
      })
    )
  })

  it("provides bound setPaymentSource to context consumers", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    let capturedCtx: any = null

    function Consumer() {
      capturedCtx = useContext(PaymentMethodContext)
      return null
    }

    render(
      <Providers>
        <PaymentMethodsContainer>
          <Consumer />
        </PaymentMethodsContainer>
      </Providers>
    )

    expect(typeof capturedCtx.setPaymentSource).toBe("function")
    expect(typeof capturedCtx.setPaymentMethod).toBe("function")
    expect(typeof capturedCtx.destroyPaymentSource).toBe("function")
  })
})
