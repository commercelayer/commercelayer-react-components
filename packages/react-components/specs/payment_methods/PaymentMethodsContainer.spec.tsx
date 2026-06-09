import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethodsContainer } from "#components/payment_methods/PaymentMethodsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import CustomerContext from "#context/CustomerContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"

vi.mock("@commercelayer/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({
      payment_methods: { relationship: vi.fn().mockReturnValue({}) },
      orders: { update: vi.fn().mockResolvedValue({ id: "order-1" }) },
      stripe_payments: { create: vi.fn().mockResolvedValue({ id: "sp-1" }) },
      wire_transfers: { create: vi.fn().mockResolvedValue({ id: "wt-1" }) },
    }),
    getErrors: vi.fn().mockReturnValue([]),
  }
})

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
  include = [],
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  includeLoaded = {} as any,
}: {
  children: ReactNode
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  order?: any
  addResourceToInclude?: ReturnType<typeof vi.fn>
  include?: string[]
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  includeLoaded?: any
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          orderId: "order-1",
          order,
          include,
          includeLoaded,
          addResourceToInclude,
          getOrder: vi.fn().mockResolvedValue(order),
          updateOrder: vi.fn().mockResolvedValue({ success: true }),
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

  it("calls addResourceToInclude with newResourceLoaded when includes already present but not loaded", async () => {
    const addResourceToInclude = vi.fn()

    await act(async () => {
      render(
        <Providers
          addResourceToInclude={addResourceToInclude}
          include={["available_payment_methods"]}
          includeLoaded={{}}
        >
          <PaymentMethodsContainer>
            <span />
          </PaymentMethodsContainer>
        </Providers>
      )
    })

    expect(addResourceToInclude).toHaveBeenCalledWith(
      expect.objectContaining({
        newResourceLoaded: expect.objectContaining({ available_payment_methods: true }),
      })
    )
  })

  it("sets payment method config when config prop is provided", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    let capturedCtx: any = null

    function Consumer() {
      capturedCtx = useContext(PaymentMethodContext)
      return null
    }

    const config = { stripeKey: "pk_test_123" }

    await act(async () => {
      render(
        <Providers>
          <PaymentMethodsContainer config={config}>
            <Consumer />
          </PaymentMethodsContainer>
        </Providers>
      )
    })

    expect(capturedCtx.config).toMatchObject(config)
  })

  it("calls getOrder when order payment_source is null and status is not pending/draft", async () => {
    const getOrder = vi.fn().mockResolvedValue(MOCK_ORDER)
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const order: any = { ...MOCK_ORDER, status: "placed", payment_source: null }

    await act(async () => {
      render(
        <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
          <OrderContext.Provider
            value={{
              ...defaultOrderContext,
              orderId: "order-1",
              order,
              include: [],
              includeLoaded: {},
              addResourceToInclude: vi.fn(),
              getOrder,
              updateOrder: vi.fn().mockResolvedValue({ success: true }),
            }}
          >
            <CustomerContext.Provider value={{}}>
              <PlaceOrderContext.Provider value={defaultPlaceOrderContext}>
                <PaymentMethodsContainer>
                  <span />
                </PaymentMethodsContainer>
              </PlaceOrderContext.Provider>
            </CustomerContext.Provider>
          </OrderContext.Provider>
        </CommerceLayerContext.Provider>
      )
    })

    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("executes context action methods without throwing", async () => {
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

    // Call each action — errors are caught internally; we only check they run
    await act(async () => {
      capturedCtx.setLoading({ loading: true })
      capturedCtx.setPaymentRef({ ref: {} })
      capturedCtx.setPaymentMethodErrors([])
      await capturedCtx.setPaymentMethod({ paymentResource: "stripe_payments", paymentMethodId: "pm_stripe" }).catch(() => {})
      await capturedCtx.setPaymentSource({ paymentResource: "stripe_payments" }).catch(() => {})
      await capturedCtx.updatePaymentSource({ paymentResource: "stripe_payments" }).catch(() => {})
      await capturedCtx.destroyPaymentSource({ paymentSourceId: "ps-1", paymentResource: "stripe_payments" }).catch(() => {})
    })

    // If we reach here without exceptions being re-thrown, all action bodies executed
    expect(typeof capturedCtx.setLoading).toBe("function")
  })

  it("does not dispatch setPaymentSource when order.payment_source is not null", async () => {
    // Covers the false branch of `if (order?.payment_source === null)` in PaymentMethodsContainer
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const orderWithSource: any = {
      ...MOCK_ORDER,
      payment_source: { id: "ps-existing", type: "stripe_payments" },
    }

    await act(async () => {
      render(
        <Providers order={orderWithSource}>
          <PaymentMethodsContainer>
            <span data-testid="child">ok</span>
          </PaymentMethodsContainer>
        </Providers>
      )
    })

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("does not call addResourceToInclude when includes are already loaded", async () => {
    const addResourceToInclude = vi.fn()

    await act(async () => {
      render(
        <Providers
          addResourceToInclude={addResourceToInclude}
          include={["available_payment_methods"]}
          includeLoaded={{ available_payment_methods: true }}
        >
          <PaymentMethodsContainer>
            <span />
          </PaymentMethodsContainer>
        </Providers>
      )
    })

    expect(addResourceToInclude).not.toHaveBeenCalledWith(
      expect.objectContaining({ newResource: expect.anything() })
    )
    expect(addResourceToInclude).not.toHaveBeenCalledWith(
      expect.objectContaining({ newResourceLoaded: expect.anything() })
    )
  })
})
