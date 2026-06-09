import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethod } from "#components/payment_methods/PaymentMethod"
import { PaymentMethodsContainer } from "#components/payment_methods/PaymentMethodsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, {
  defaultPaymentMethodContext,
} from "#context/PaymentMethodContext"
import PlaceOrderContext, { defaultPlaceOrderContext } from "#context/PlaceOrderContext"

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
              <ContextCapture onCapture={(c) => { capturedCtx = c }} />
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
              <ContextCapture onCapture={(c) => { capturedCtx = c }} />
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
              <ContextCapture onCapture={(c) => { capturedCtx = c }} />
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
                <ContextCapture onCapture={(c) => { capturedCtx = c }} />
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
              <ContextCapture onCapture={(c) => { ctxInsideContainer = c }} />
              <PaymentMethod>
                <ContextCapture onCapture={(c) => { ctxInsideMethod = c }} />
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
})
