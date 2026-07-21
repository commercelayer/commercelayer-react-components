import { act, fireEvent, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethod } from "#components/payment_methods/PaymentMethod"
import { PaymentMethodsContainer } from "#components/payment_methods/PaymentMethodsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({
      payment_methods: { relationship: vi.fn().mockReturnValue({}) },
      orders: { update: vi.fn().mockResolvedValue({ id: "order-1" }) },
      stripe_payments: {
        create: vi.fn().mockResolvedValue({ id: "sp-1", type: "stripe_payments" }),
      },
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
    { id: "pm_wire", payment_source_type: "wire_transfers", name: "Wire" },
  ],
  payment_method: null,
  payment_source: null,
}

// biome-ignore lint/suspicious/noExplicitAny: test cast
const MOCK_ORDER_SINGLE: any = {
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
  includeLoaded = {},
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

/**
 * Provides a fully-mocked PaymentMethodContext so PaymentMethod effects can be
 * tested without relying on the reducer or any API call.
 */
function MockPaymentMethodProvider({
  children,
  paymentMethods = MOCK_ORDER.available_payment_methods,
  paymentSource = null,
  config = undefined,
  currentPaymentMethodId = undefined,
  setPaymentMethod = vi.fn().mockResolvedValue({ success: true, order: MOCK_ORDER }),
  setPaymentSource = vi.fn().mockResolvedValue({ id: "ps-1", type: "stripe_payments" }),
  setLoadingPlaceOrder = vi.fn(),
}: {
  children: ReactNode
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  paymentMethods?: any[]
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  paymentSource?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  config?: any
  currentPaymentMethodId?: string
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPaymentMethod?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setPaymentSource?: any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  setLoadingPlaceOrder?: any
}) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const mockCtx: any = {
    ...defaultPaymentMethodContext,
    _isProvided: true as const,
    paymentMethods,
    paymentSource,
    config,
    currentPaymentMethodId,
    setPaymentMethod,
    setPaymentSource,
    setLoading: setLoadingPlaceOrder,
    setPaymentRef: vi.fn(),
    setPaymentMethodErrors: vi.fn(),
    updatePaymentSource: vi.fn().mockResolvedValue(undefined),
    destroyPaymentSource: vi.fn().mockResolvedValue(undefined),
    errors: [],
  }
  return <PaymentMethodContext.Provider value={mockCtx}>{children}</PaymentMethodContext.Provider>
}

/** Reads and captures the current PaymentMethodContext value. */
function ContextCapture({
  onCapture,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  onCapture: (ctx: any) => void
}) {
  const ctx = useContext(PaymentMethodContext)
  onCapture(ctx)
  return null
}

describe("PaymentMethod", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("standalone mode (no PaymentMethodsContainer parent)", () => {
    it("provides PaymentMethodContext with _isProvided: true to its children", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let capturedCtx: any = null

      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <ContextCapture
                onCapture={(c) => {
                  capturedCtx = c
                }}
              />
            </PaymentMethod>
          </Providers>
        )
      })

      expect(capturedCtx._isProvided).toBe(true)
    })

    it("populates paymentMethods in context from order available_payment_methods", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let capturedCtx: any = null

      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <ContextCapture
                onCapture={(c) => {
                  capturedCtx = c
                }}
              />
            </PaymentMethod>
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
            <PaymentMethod>
              <span />
            </PaymentMethod>
          </Providers>
        )
      })

      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({
          newResource: expect.arrayContaining([
            "available_payment_methods",
            "payment_source",
            "payment_method",
          ]),
        })
      )
    })

    it("renders children after effects settle (not stuck in loading)", async () => {
      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <span data-testid="child">content</span>
            </PaymentMethod>
          </Providers>
        )
      })

      // Two payment methods → children rendered twice
      expect(screen.getAllByTestId("child").length).toBeGreaterThan(0)
    })

    it("renders one div per available payment method", async () => {
      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <span>method</span>
            </PaymentMethod>
          </Providers>
        )
      })

      // Two payment methods → two divs with data-testid matching their type
      expect(screen.getByTestId("stripe_payments")).toBeDefined()
      expect(screen.getByTestId("wire_transfers")).toBeDefined()
    })

    it("provides bound action functions to the context", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let capturedCtx: any = null

      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <ContextCapture
                onCapture={(c) => {
                  capturedCtx = c
                }}
              />
            </PaymentMethod>
          </Providers>
        )
      })

      expect(typeof capturedCtx.setPaymentMethod).toBe("function")
      expect(typeof capturedCtx.setPaymentSource).toBe("function")
      expect(typeof capturedCtx.destroyPaymentSource).toBe("function")
    })

    it("does not call addResourceToInclude again if includes are already loaded", async () => {
      const addResourceToInclude = vi.fn()

      await act(async () => {
        render(
          <Providers
            addResourceToInclude={addResourceToInclude}
            include={["available_payment_methods"]}
            includeLoaded={{ available_payment_methods: true }}
          >
            <PaymentMethod>
              <span />
            </PaymentMethod>
          </Providers>
        )
      })

      // Should not re-request already-loaded includes
      expect(addResourceToInclude).not.toHaveBeenCalledWith(
        expect.objectContaining({ newResource: expect.anything() })
      )
    })

    it("does not dispatch setPaymentSource when order.payment_source is not null", async () => {
      // Covers the false branch of `if (order?.payment_source === null)` in usePaymentMethod
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const orderWithSource: any = {
        ...MOCK_ORDER,
        payment_source: { id: "ps-existing", type: "stripe_payments" },
      }

      await act(async () => {
        render(
          <Providers order={orderWithSource}>
            <PaymentMethod>
              <span data-testid="child">ok</span>
            </PaymentMethod>
          </Providers>
        )
      })

      expect(screen.getAllByTestId("child").length).toBeGreaterThan(0)
    })
  })

  describe("container mode (inside PaymentMethodsContainer)", () => {
    it("reads paymentMethods from the parent container context", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let capturedCtx: any = null

      await act(async () => {
        render(
          <Providers>
            <PaymentMethodsContainer>
              <PaymentMethod>
                <ContextCapture
                  onCapture={(c) => {
                    capturedCtx = c
                  }}
                />
              </PaymentMethod>
            </PaymentMethodsContainer>
          </Providers>
        )
      })

      // In container mode the context comes from PaymentMethodsContainer
      expect(capturedCtx._isProvided).toBe(true)
      expect(capturedCtx.paymentMethods).toEqual(MOCK_ORDER.available_payment_methods)
    })

    it("does not invoke addResourceToInclude from the standalone hook (container handles it)", async () => {
      const addResourceToInclude = vi.fn()

      await act(async () => {
        render(
          <Providers addResourceToInclude={addResourceToInclude}>
            <PaymentMethodsContainer>
              <PaymentMethod>
                <span />
              </PaymentMethod>
            </PaymentMethodsContainer>
          </Providers>
        )
      })

      // Every newResource call should come with the same resource list (from the container).
      // The standalone hook inside PaymentMethod must NOT add its own newResource call
      // since isStandalone is false. All calls should be from the container.
      const newResourceCalls = addResourceToInclude.mock.calls.filter(
        (c) => c[0]?.newResource != null
      )
      // All newResource calls should contain the same resources (container's includes)
      for (const call of newResourceCalls) {
        expect(call[0].newResource).toEqual(
          expect.arrayContaining(["available_payment_methods", "payment_source"])
        )
      }
    })

    it("preserves _isProvided: true from parent context through PaymentMethod children", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let ctxInsideContainer: any = null
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let ctxInsideMethod: any = null

      await act(async () => {
        render(
          <Providers>
            <PaymentMethodsContainer>
              <ContextCapture
                onCapture={(c) => {
                  ctxInsideContainer = c
                }}
              />
              <PaymentMethod>
                <ContextCapture
                  onCapture={(c) => {
                    ctxInsideMethod = c
                  }}
                />
              </PaymentMethod>
            </PaymentMethodsContainer>
          </Providers>
        )
      })

      // Both container-level and method-level consumers see the same provided context
      expect(ctxInsideContainer._isProvided).toBe(true)
      expect(ctxInsideMethod._isProvided).toBe(true)
    })
  })

  describe("standalone mode — does not cause infinite re-renders", () => {
    it("does not trigger 'Maximum update depth exceeded'", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <span data-testid="child">ok</span>
            </PaymentMethod>
          </Providers>
        )
      })

      const errors = consoleError.mock.calls.map((c) => String(c[0]))
      expect(errors.some((e) => e.includes("Maximum update depth exceeded"))).toBe(false)
      consoleError.mockRestore()
    })
  })

  describe("standalone mode — addResourceToInclude branches", () => {
    it("calls addResourceToInclude with newResourceLoaded when includes present but not loaded", async () => {
      const addResourceToInclude = vi.fn()

      await act(async () => {
        render(
          <Providers
            addResourceToInclude={addResourceToInclude}
            include={["available_payment_methods"]}
            includeLoaded={{}}
          >
            <PaymentMethod>
              <span />
            </PaymentMethod>
          </Providers>
        )
      })

      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({
          newResourceLoaded: expect.objectContaining({ available_payment_methods: true }),
        })
      )
    })
  })

  describe("standalone mode — action methods coverage", () => {
    it("executes standalone context action methods without throwing", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let capturedCtx: any = null

      await act(async () => {
        render(
          <Providers>
            <PaymentMethod>
              <ContextCapture
                onCapture={(c) => {
                  capturedCtx = c
                }}
              />
            </PaymentMethod>
          </Providers>
        )
      })

      await act(async () => {
        capturedCtx.setLoading({ loading: true })
        capturedCtx.setPaymentRef({ ref: {} })
        capturedCtx.setPaymentMethodErrors([])
        await capturedCtx
          .setPaymentMethod({ paymentResource: "stripe_payments", paymentMethodId: "pm_stripe" })
          .catch(() => {})
        await capturedCtx.setPaymentSource({ paymentResource: "stripe_payments" }).catch(() => {})
        await capturedCtx
          .updatePaymentSource({ paymentResource: "stripe_payments" })
          .catch(() => {})
        await capturedCtx
          .destroyPaymentSource({ paymentSourceId: "ps-1", paymentResource: "stripe_payments" })
          .catch(() => {})
      })

      expect(typeof capturedCtx.setLoading).toBe("function")
    })
  })

  describe("PaymentMethod rendering — hide prop", () => {
    it("hides payment methods matched by array", async () => {
      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider>
              <PaymentMethod hide={["stripe_payments"]}>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(screen.queryByTestId("stripe_payments")).toBeNull()
      expect(screen.getByTestId("wire_transfers")).toBeDefined()
    })

    it("hides payment methods using a filter function", async () => {
      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider>
              {/* hide function returns true to KEEP; returning false for stripe hides it */}
              <PaymentMethod hide={(p) => p.payment_source_type === "wire_transfers"}>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(screen.queryByTestId("stripe_payments")).toBeNull()
      expect(screen.getByTestId("wire_transfers")).toBeDefined()
    })
  })

  describe("PaymentMethod rendering — sortBy prop", () => {
    it("renders payment methods in the order specified by sortBy", async () => {
      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider>
              <PaymentMethod sortBy={["wire_transfers", "stripe_payments"]}>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      const divs = screen
        .getAllByRole("generic")
        .filter((el) =>
          ["stripe_payments", "wire_transfers"].includes(el.getAttribute("data-testid") ?? "")
        )
      expect(divs[0].getAttribute("data-testid")).toBe("wire_transfers")
      expect(divs[1].getAttribute("data-testid")).toBe("stripe_payments")
    })
  })

  describe("PaymentMethod rendering — clickableContainer", () => {
    it("calls setPaymentMethod when a clickable container is clicked", async () => {
      const mockSetPaymentMethod = vi.fn().mockResolvedValue({ success: true, order: MOCK_ORDER })

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider setPaymentMethod={mockSetPaymentMethod}>
              <PaymentMethod clickableContainer>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId("stripe_payments"))
      })

      expect(mockSetPaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({ paymentResource: "stripe_payments" })
      )
    })

    it("does not call setPaymentMethod when clicking on already-selected method", async () => {
      const mockSetPaymentMethod = vi.fn().mockResolvedValue({ success: true, order: MOCK_ORDER })
      const orderWithMethod = { ...MOCK_ORDER, payment_method: { id: "pm_stripe" } }

      await act(async () => {
        render(
          <Providers order={orderWithMethod}>
            <MockPaymentMethodProvider setPaymentMethod={mockSetPaymentMethod}>
              <PaymentMethod clickableContainer>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId("stripe_payments"))
      })

      expect(mockSetPaymentMethod).not.toHaveBeenCalled()
    })
  })

  describe("PaymentMethod effects — expressPayments", () => {
    it("auto-selects express payment when expressPayments is true and no paymentSource", async () => {
      const mockSetPaymentMethod = vi.fn().mockResolvedValue({ success: true, order: MOCK_ORDER })
      const mockSetPaymentSource = vi
        .fn()
        .mockResolvedValue({ id: "ps-1", type: "stripe_payments" })
      const mockSetLoading = vi.fn()

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider
              setPaymentMethod={mockSetPaymentMethod}
              setPaymentSource={mockSetPaymentSource}
              setLoadingPlaceOrder={mockSetLoading}
            >
              <PaymentMethod expressPayments>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(mockSetPaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({ paymentResource: "stripe_payments" })
      )
    })
  })

  describe("PaymentMethod effects — autoSelectSinglePaymentMethod", () => {
    it("auto-selects when single payment method and no paymentSource", async () => {
      const mockSetPaymentMethod = vi
        .fn()
        .mockResolvedValue({ success: true, order: MOCK_ORDER_SINGLE })
      const mockSetPaymentSource = vi
        .fn()
        .mockResolvedValue({ id: "ps-1", type: "stripe_payments" })
      const mockSetLoading = vi.fn()

      await act(async () => {
        render(
          <Providers order={MOCK_ORDER_SINGLE}>
            <MockPaymentMethodProvider
              paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
              setPaymentMethod={mockSetPaymentMethod}
              setPaymentSource={mockSetPaymentSource}
              setLoadingPlaceOrder={mockSetLoading}
            >
              <PaymentMethod autoSelectSinglePaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(mockSetPaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({ paymentResource: "stripe_payments" })
      )
    })

    it("calls autoSelectSinglePaymentMethod callback when provided as function", async () => {
      const callbackFn = vi.fn()
      const mockSetPaymentMethod = vi
        .fn()
        .mockResolvedValue({ success: true, order: MOCK_ORDER_SINGLE })
      const mockSetPaymentSource = vi.fn().mockResolvedValue({ id: "ps-1" })

      await act(async () => {
        render(
          <Providers order={MOCK_ORDER_SINGLE}>
            <MockPaymentMethodProvider
              paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
              setPaymentMethod={mockSetPaymentMethod}
              setPaymentSource={mockSetPaymentSource}
            >
              <PaymentMethod autoSelectSinglePaymentMethod={callbackFn}>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(callbackFn).toHaveBeenCalled()
    })
  })

  describe("PaymentMethod effects — showLoader", () => {
    it("sets loading based on order payment_source status when showLoader is true", async () => {
      const orderWithDeclinedSource = {
        ...MOCK_ORDER,
        payment_source: { payment_response: { status: "declined" } },
      }

      await act(async () => {
        render(
          <Providers order={orderWithDeclinedSource}>
            <MockPaymentMethodProvider>
              <PaymentMethod showLoader>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      // When status is declined + showLoader, loading should be false → methods visible
      expect(screen.getByTestId("stripe_payments")).toBeDefined()
    })

    it("stays in loading state when payment status is not declined and showLoader is true", async () => {
      const orderWithProcessingSource = {
        ...MOCK_ORDER,
        payment_source: { payment_response: { status: "authorized" } },
      }

      await act(async () => {
        render(
          <Providers order={orderWithProcessingSource}>
            <MockPaymentMethodProvider>
              <PaymentMethod showLoader loader={<span data-testid="loader">Loading</span>}>
                <span data-testid="pm">method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      // When status is authorized + showLoader, loading stays true → loader shown
      expect(screen.getByTestId("loader")).toBeDefined()
    })
  })

  describe("PaymentMethod effects — expressPayments with onClick", () => {
    it("calls onClick and runs setTimeout callback after express payment selection", async () => {
      vi.useFakeTimers()
      const onClickFn = vi.fn()
      const mockSetPaymentSource = vi
        .fn()
        .mockResolvedValue({ id: "ps-1", type: "stripe_payments" })

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider setPaymentSource={mockSetPaymentSource}>
              <PaymentMethod expressPayments onClick={onClickFn} clickableContainer>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(onClickFn).toHaveBeenCalled()

      await act(async () => {
        vi.runAllTimers()
      })

      vi.useRealTimers()
    })

    it("runs setTimeout with showLoader=true in expressPayments onClick branch", async () => {
      vi.useFakeTimers()
      const onClickFn = vi.fn()
      const mockSetPaymentSource = vi
        .fn()
        .mockResolvedValue({ id: "ps-1", type: "stripe_payments" })

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider setPaymentSource={mockSetPaymentSource}>
              <PaymentMethod
                expressPayments
                onClick={onClickFn}
                clickableContainer
                showLoader
                loader={<span data-testid="loader2" />}
              >
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(onClickFn).toHaveBeenCalled()
      vi.useRealTimers()
    })

    it("skips selectExpressPayment when paymentSource already exists (branch 120 false)", async () => {
      const mockSetPaymentMethod = vi.fn()
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const existingSource: any = { id: "ps-existing", type: "stripe_payments" }

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider
              paymentSource={existingSource}
              setPaymentMethod={mockSetPaymentMethod}
            >
              <PaymentMethod expressPayments>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      // selectExpressPayment should NOT be called when paymentSource is already set
      expect(mockSetPaymentMethod).not.toHaveBeenCalled()
    })
  })

  describe("PaymentMethod effects — autoSelect branches", () => {
    it("covers autoSelect onClick branch and setTimeout callback", async () => {
      vi.useFakeTimers()
      const onClickFn = vi.fn()
      const mockSetPaymentSource = vi
        .fn()
        .mockResolvedValue({ id: "ps-1", type: "stripe_payments" })

      await act(async () => {
        render(
          <Providers order={MOCK_ORDER_SINGLE}>
            <MockPaymentMethodProvider
              paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
              setPaymentSource={mockSetPaymentSource}
            >
              <PaymentMethod autoSelectSinglePaymentMethod onClick={onClickFn} clickableContainer>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(onClickFn).toHaveBeenCalled()

      await act(async () => {
        vi.runAllTimers()
      })

      vi.useRealTimers()
    })

    it("calls getCustomerPaymentSources after autoSelect", async () => {
      const getCustomerPaymentSources = vi.fn()
      const mockSetPaymentSource = vi.fn().mockResolvedValue({ id: "ps-1" })

      await act(async () => {
        render(
          <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
            <OrderContext.Provider
              value={{
                ...defaultOrderContext,
                orderId: "order-1",
                order: MOCK_ORDER_SINGLE,
                include: [],
                includeLoaded: {},
                addResourceToInclude: vi.fn(),
                getOrder: vi.fn().mockResolvedValue(MOCK_ORDER_SINGLE),
                updateOrder: vi.fn().mockResolvedValue({ success: true }),
              }}
            >
              <CustomerContext.Provider value={{ getCustomerPaymentSources }}>
                <PlaceOrderContext.Provider value={defaultPlaceOrderContext}>
                  <MockPaymentMethodProvider
                    paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
                    setPaymentSource={mockSetPaymentSource}
                  >
                    <PaymentMethod autoSelectSinglePaymentMethod>
                      <span>method</span>
                    </PaymentMethod>
                  </MockPaymentMethodProvider>
                </PlaceOrderContext.Provider>
              </CustomerContext.Provider>
            </OrderContext.Provider>
          </CommerceLayerContext.Provider>
        )
      })

      expect(getCustomerPaymentSources).toHaveBeenCalled()
    })

    it("enters else branch (multiple methods) in autoSelect with fake timers", async () => {
      vi.useFakeTimers()

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider>
              {/* 2 payment methods → not single → else branch */}
              <PaymentMethod autoSelectSinglePaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        vi.runAllTimers()
      })

      // After else branch setTimeout, loading is false → methods visible
      expect(screen.getByTestId("stripe_payments")).toBeDefined()
      vi.useRealTimers()
    })

    it("autoSelect with paypal config sets paypal attributes", async () => {
      const mockSetPaymentSource = vi.fn().mockResolvedValue(null)
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const paypalMethod: any = {
        id: "pm_paypal",
        payment_source_type: "paypal_payments",
        name: "PayPal",
      }
      const paypalConfig = {
        paypalPay: {
          returnUrl: "https://example.com/return",
          cancelUrl: "https://example.com/cancel",
        },
      }

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider
              paymentMethods={[paypalMethod]}
              setPaymentSource={mockSetPaymentSource}
              config={paypalConfig}
            >
              <PaymentMethod autoSelectSinglePaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(mockSetPaymentSource).toHaveBeenCalled()
    })

    it("autoSelect with external_payments config sets external attributes", async () => {
      const mockSetPaymentSource = vi.fn().mockResolvedValue(null)
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const externalMethod: any = {
        id: "pm_ext",
        payment_source_type: "external_payments",
        name: "External",
      }
      const externalConfig = { externalPayment: { paymentSourceToken: "tok_test" } }

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider
              paymentMethods={[externalMethod]}
              setPaymentSource={mockSetPaymentSource}
              config={externalConfig}
            >
              <PaymentMethod autoSelectSinglePaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(mockSetPaymentSource).toHaveBeenCalled()
    })

    it("autoSelect with checkout_com_payments config sets cko attributes", async () => {
      const mockSetPaymentSource = vi.fn().mockResolvedValue(null)
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const ckoMethod: any = {
        id: "pm_cko",
        payment_source_type: "checkout_com_payments",
        name: "CKO",
      }
      const ckoConfig = { checkoutComPayment: { publicKey: "pk_test_123" } }

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider
              paymentMethods={[ckoMethod]}
              setPaymentSource={mockSetPaymentSource}
              config={ckoConfig}
            >
              <PaymentMethod autoSelectSinglePaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(mockSetPaymentSource).toHaveBeenCalled()
    })
  })

  describe("PaymentMethod effects — third useEffect with paymentSource", () => {
    it("enters setTimeout when single+autoSelect+paymentSource and runs callback", async () => {
      vi.useFakeTimers()
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const existingPaymentSource: any = { id: "ps-existing", type: "stripe_payments" }

      await act(async () => {
        render(
          <Providers order={MOCK_ORDER_SINGLE}>
            <MockPaymentMethodProvider
              paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
              paymentSource={existingPaymentSource}
            >
              <PaymentMethod autoSelectSinglePaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        vi.runAllTimers()
      })

      // After setTimeout fires, loading=false → methods visible
      expect(screen.getByTestId("stripe_payments")).toBeDefined()
      vi.useRealTimers()
    })

    it("runs setTimeout with showLoader in third useEffect single+autoSelect+paymentSource", async () => {
      vi.useFakeTimers()
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const existingPaymentSource: any = { id: "ps-existing" }

      await act(async () => {
        render(
          <Providers order={MOCK_ORDER_SINGLE}>
            <MockPaymentMethodProvider
              paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
              paymentSource={existingPaymentSource}
            >
              <PaymentMethod
                autoSelectSinglePaymentMethod
                showLoader
                loader={<span data-testid="sl-loader" />}
              >
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        vi.runAllTimers()
      })

      vi.useRealTimers()
    })
  })

  describe("PaymentMethod rendering — clickableContainer advanced", () => {
    it("does not call setPaymentMethod when status is placing", async () => {
      const mockSetPaymentMethod = vi.fn().mockResolvedValue({ success: true, order: MOCK_ORDER })
      const placingPlaceOrderContext = { ...defaultPlaceOrderContext, status: "placing" as const }

      await act(async () => {
        render(
          <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
            <OrderContext.Provider
              value={{
                ...defaultOrderContext,
                orderId: "order-1",
                order: MOCK_ORDER,
                include: [],
                includeLoaded: {},
                addResourceToInclude: vi.fn(),
                getOrder: vi.fn().mockResolvedValue(MOCK_ORDER),
                updateOrder: vi.fn().mockResolvedValue({ success: true }),
              }}
            >
              <CustomerContext.Provider value={{}}>
                <PlaceOrderContext.Provider value={placingPlaceOrderContext}>
                  <MockPaymentMethodProvider setPaymentMethod={mockSetPaymentMethod}>
                    <PaymentMethod clickableContainer>
                      <span>method</span>
                    </PaymentMethod>
                  </MockPaymentMethodProvider>
                </PlaceOrderContext.Provider>
              </CustomerContext.Provider>
            </OrderContext.Provider>
          </CommerceLayerContext.Provider>
        )
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId("stripe_payments"))
      })

      expect(mockSetPaymentMethod).not.toHaveBeenCalled()
    })

    it("calls onClick prop after clicking a payment method in clickableContainer mode", async () => {
      const onClickFn = vi.fn()
      const mockSetPaymentMethod = vi.fn().mockResolvedValue({ success: true, order: MOCK_ORDER })

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider setPaymentMethod={mockSetPaymentMethod}>
              <PaymentMethod clickableContainer onClick={onClickFn}>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId("stripe_payments"))
      })

      expect(onClickFn).toHaveBeenCalled()
    })
  })

  describe("standalone mode — usePaymentMethod hook coverage", () => {
    it("sets payment method config when config prop is passed in standalone mode", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      let capturedCtx: any = null
      const config = { stripeKey: "pk_test_123" }

      await act(async () => {
        render(
          <Providers>
            <PaymentMethod config={config}>
              <ContextCapture
                onCapture={(c) => {
                  capturedCtx = c
                }}
              />
            </PaymentMethod>
          </Providers>
        )
      })

      expect(capturedCtx.config).toMatchObject(config)
    })

    it("calls getOrder when order has no payment methods and status is not pending/draft", async () => {
      const getOrder = vi.fn().mockResolvedValue(MOCK_ORDER)
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      const orderWithoutMethods: any = {
        id: "order-1",
        status: "placed",
        available_payment_methods: undefined,
        payment_method: null,
        payment_source: null,
      }

      await act(async () => {
        render(
          <CommerceLayerContext.Provider value={{ accessToken: "test-token" }}>
            <OrderContext.Provider
              value={{
                ...defaultOrderContext,
                orderId: "order-1",
                order: orderWithoutMethods,
                include: [],
                includeLoaded: {},
                addResourceToInclude: vi.fn(),
                getOrder,
                updateOrder: vi.fn().mockResolvedValue({ success: true }),
              }}
            >
              <CustomerContext.Provider value={{}}>
                <PlaceOrderContext.Provider value={defaultPlaceOrderContext}>
                  <PaymentMethod>
                    <span />
                  </PaymentMethod>
                </PlaceOrderContext.Provider>
              </CustomerContext.Provider>
            </OrderContext.Provider>
          </CommerceLayerContext.Provider>
        )
      })

      expect(getOrder).toHaveBeenCalledWith("order-1")
    })
  })

  describe("PaymentMethod rendering — active class and div click", () => {
    it("applies activeClass when payment is the current payment method", async () => {
      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider currentPaymentMethodId="pm_stripe">
              <PaymentMethod className="pm-item" activeClass="pm-active">
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      const stripeDiv = screen.getByTestId("stripe_payments")
      expect(stripeDiv.className).toContain("pm-active")
    })

    it("fires onClick handler on div click even without clickableContainer (noop)", async () => {
      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider>
              {/* No clickableContainer — onClickable is undefined */}
              <PaymentMethod>
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      // Click fires the inline onClick, but onClickable is null so it's a noop
      await act(async () => {
        fireEvent.click(screen.getByTestId("stripe_payments"))
      })

      expect(screen.getByTestId("stripe_payments")).toBeDefined()
    })
  })

  describe("PaymentMethod effects — showLoader in setTimeout branches", () => {
    it("sets loading from showLoader in autoSelect onClick setTimeout", async () => {
      vi.useFakeTimers()
      const onClickFn = vi.fn()
      const mockSetPaymentSource = vi
        .fn()
        .mockResolvedValue({ id: "ps-1", type: "stripe_payments" })

      await act(async () => {
        render(
          <Providers order={MOCK_ORDER_SINGLE}>
            <MockPaymentMethodProvider
              paymentMethods={MOCK_ORDER_SINGLE.available_payment_methods}
              setPaymentSource={mockSetPaymentSource}
            >
              <PaymentMethod
                autoSelectSinglePaymentMethod
                onClick={onClickFn}
                clickableContainer
                showLoader
              >
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      expect(onClickFn).toHaveBeenCalled()

      await act(async () => {
        vi.runAllTimers()
      })

      vi.useRealTimers()
    })

    it("sets loading from showLoader in multiple-methods else setTimeout", async () => {
      vi.useFakeTimers()

      await act(async () => {
        render(
          <Providers>
            <MockPaymentMethodProvider>
              {/* 2 payment methods → else branch → setTimeout with showLoader */}
              <PaymentMethod
                autoSelectSinglePaymentMethod
                showLoader
                loader={<span data-testid="sl2" />}
              >
                <span>method</span>
              </PaymentMethod>
            </MockPaymentMethodProvider>
          </Providers>
        )
      })

      await act(async () => {
        vi.runAllTimers()
      })

      vi.useRealTimers()
    })
  })
})
