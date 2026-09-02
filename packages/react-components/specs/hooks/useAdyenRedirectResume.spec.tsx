import type { Order, PaymentSession, PaymentSetting } from "@commercelayer/sdk"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { useAdyenRedirectResume } from "#hooks/useAdyenRedirectResume"
import { getHandoffSnapshot, resetPaymentGatewayStore } from "#utils/paymentGatewayStore"

const adyen = vi.hoisted(() => ({
  submitDetails: vi.fn(),
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  captured: { options: null as any },
  shouldReject: false,
}))

vi.mock("@adyen/adyen-web/auto", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  AdyenCheckout: vi.fn(async (options: any) => {
    adyen.captured.options = options
    if (adyen.shouldReject) throw new Error("session expired")
    return { submitDetails: adyen.submitDetails }
  }),
  Dropin: class {},
}))

// Cast where the fixture is defined, as the core specs do, rather than at
// every call site: `available_payment_settings` is the six-member per-provider
// union, and a literal without `created_at`/`updated_at` matches none of them.
const ADYEN_SETTING = {
  id: "ps-adyen",
  type: "payment_setting_adyens",
  public_key: "test_ABC123",
} as unknown as PaymentSetting

function adyenSession(overrides: Record<string, unknown> = {}): PaymentSession {
  return {
    id: "session-adyen",
    type: "payment_sessions",
    status: "unpaid",
    payment_setting: { id: "ps-adyen", type: "payment_setting_adyens" },
    response_data: { id: "CS-ORDER", sessionData: "blob-from-order" },
    ...overrides,
  } as unknown as PaymentSession
}

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [ADYEN_SETTING],
    payment_sessions: [adyenSession()],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function wrapper(currentOrder: Partial<Order> | null) {
  return ({ children }: { children: ReactNode }) => (
    <OrderContext.Provider
      value={{ ...defaultOrderContext, order: currentOrder ?? undefined, getOrder } as never}
    >
      {children}
    </OrderContext.Provider>
  )
}

function visit(search: string) {
  window.history.replaceState({}, "", `/checkout${search}`)
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  adyen.captured.options = null
  adyen.shouldReject = false
  getOrder.mockResolvedValue(order())
})

describe("useAdyenRedirectResume", () => {
  it("does nothing on an ordinary page load", async () => {
    visit("")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    expect(adyen.captured.options).toBeNull()
    expect(getHandoffSnapshot("order-1").resumePhase).toBe("idle")
  })

  it("waits for the order rather than burning the single-use value", async () => {
    // `redirectResult` cannot be submitted twice, so it stays in the URL until
    // there is an order with sessions to match it against.
    visit("?redirectResult=wait-for-order")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(null) })

    expect(adyen.captured.options).toBeNull()
    expect(window.location.search).toContain("redirectResult")
  })

  it("resumes from the order, not from the sessionId in the query", async () => {
    // The order is the version that survives a different browser, cleared
    // storage or private mode, where adyen-web's localStorage cache is absent.
    visit("?redirectResult=resume-ok&sessionId=CS-FROM-QUERY")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    await waitFor(() => {
      expect(adyen.submitDetails).toHaveBeenCalledWith({
        details: { redirectResult: "resume-ok" },
      })
    })
    expect(adyen.captured.options.session).toEqual({
      id: "CS-ORDER",
      sessionData: "blob-from-order",
    })
    expect(adyen.captured.options.clientKey).toBe("test_ABC123")
  })

  it("cleans Adyen's parameters out of the address bar", async () => {
    visit("?redirectResult=clean-me&sessionId=CS-9&orderId=1")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    await waitFor(() => {
      expect(window.location.search).not.toContain("redirectResult")
    })
    expect(window.location.search).not.toContain("sessionId")
    // The application's own query is not ours to remove.
    expect(window.location.search).toContain("orderId=1")
  })

  it("reports the phase so the place-order button can finish without a click", async () => {
    visit("?redirectResult=phase-ok")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    adyen.captured.options.onPaymentCompleted({ resultCode: "Authorised" })

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").resumePhase).toBe("resumed")
    })
  })

  it("carries Adyen's resultCode when the redirect comes back refused", async () => {
    visit("?redirectResult=phase-refused")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })

    await waitFor(() => {
      const snapshot = getHandoffSnapshot("order-1")
      expect(snapshot.resumePhase).toBe("failed")
      expect(snapshot.resumeErrors[0]?.meta).toEqual({ error: "Refused" })
    })
  })

  it("reports a refused setup instead of hanging on a spinner", async () => {
    // What an expired Adyen Session or an unauthorized origin looks like.
    adyen.shouldReject = true
    visit("?redirectResult=setup-fails")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    await waitFor(() => {
      const snapshot = getHandoffSnapshot("order-1")
      expect(snapshot.resumePhase).toBe("failed")
      expect(snapshot.resumeErrors[0]?.meta).toEqual({ error: "SetupFailed" })
    })
  })

  it("pulls the order back in, since the shopper was away while it changed", async () => {
    visit("?redirectResult=refetches")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    await waitFor(() => {
      expect(getOrder).toHaveBeenCalledWith("order-1")
    })
  })

  it("skips a session whose payment has already been picked up", async () => {
    visit("?redirectResult=already-authorized")
    renderHook(() => useAdyenRedirectResume(), {
      wrapper: wrapper(
        order({
          payment_sessions: [adyenSession({ payment_authorization: { status: "succeeded" } })],
        })
      ),
    })

    expect(adyen.captured.options).toBeNull()
    // Still claimed and cleaned, so the check does not repeat every render.
    await waitFor(() => {
      expect(window.location.search).not.toContain("redirectResult")
    })
  })

  it("skips a session with no Adyen Session to resume", async () => {
    visit("?redirectResult=no-response-data")
    renderHook(() => useAdyenRedirectResume(), {
      wrapper: wrapper(order({ payment_sessions: [adyenSession({ response_data: null })] })),
    })

    expect(adyen.captured.options).toBeNull()
  })

  it("does not resume a setting that is not Adyen", async () => {
    visit("?redirectResult=manual-setting")
    renderHook(() => useAdyenRedirectResume(), {
      wrapper: wrapper(
        order({
          payment_sessions: [
            adyenSession({ payment_setting: { id: "m", type: "payment_setting_manuals" } }),
          ],
        })
      ),
    })

    expect(adyen.captured.options).toBeNull()
  })

  it("submits a given redirectResult only once", async () => {
    // Adyen refuses the same value twice, so two mounted trees or a remount
    // must not both relay it.
    visit("?redirectResult=only-once")
    const { unmount } = renderHook(() => useAdyenRedirectResume(), {
      wrapper: wrapper(order()),
    })
    await waitFor(() => {
      expect(adyen.submitDetails).toHaveBeenCalledTimes(1)
    })
    unmount()

    visit("?redirectResult=only-once")
    renderHook(() => useAdyenRedirectResume(), { wrapper: wrapper(order()) })

    expect(adyen.submitDetails).toHaveBeenCalledTimes(1)
  })
})
