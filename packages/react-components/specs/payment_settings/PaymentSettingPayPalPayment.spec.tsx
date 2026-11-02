import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingPayPalPayment } from "#components/payment_settings/PaymentSettingPayPalPayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
} from "#utils/paymentGatewayStore"
import { resetPayPalSdk } from "#utils/paypal"

/**
 * A fake of PayPal's v6 SDK, deliberately shallow.
 *
 * `loadCoreSdkScript` resolves to a namespace whose instance records the
 * callbacks of the one-time payment session, so a test can play PayPal's part:
 * the window opening on `start`, the approval, the cancel.
 */
const pp = vi.hoisted(() => ({
  loadCoreSdkScript: vi.fn(),
  createInstance: vi.fn(),
  findEligibleMethods: vi.fn(),
  isEligible: vi.fn(),
  start: vi.fn(),
  destroy: vi.fn(),
  // biome-ignore lint/suspicious/noExplicitAny: test double for PayPal's session options
  options: null as any,
}))

vi.mock("@paypal/paypal-js/sdk-v6", () => ({ loadCoreSdkScript: pp.loadCoreSdkScript }))

const { authorizeMock, authorizeGiftCardsMock } = vi.hoisted(() => ({
  authorizeMock: vi.fn(),
  authorizeGiftCardsMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    authorizePaymentSession: authorizeMock,
    authorizeGiftCardSessions: authorizeGiftCardsMock,
  }
})

/** The privacy-and-terms gate, which PayPal's own click has to honour. */
const { permitted } = vi.hoisted(() => ({ permitted: { value: true } }))
vi.mock("#hooks/useCollectionPermitted", () => ({
  useCollectionPermitted: () => permitted.value,
  default: () => permitted.value,
}))

/** The token's `test` claim, which picks PayPal's sandbox or production. */
const { testMode } = vi.hoisted(() => ({ testMode: { value: true as boolean } }))
vi.mock("#utils/jwt", () => ({ jwt: () => ({ test: testMode.value }) }))

const PAYPAL_SETTING = {
  id: "ps-paypal",
  type: "payment_setting_paypals",
  name: "PayPal",
  client_id: "paypal-client-id",
} as unknown as PaymentSettingResource

const PAYPAL_SESSION = {
  id: "session-pp",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 5100,
  currency_code: "USD",
  token: "PAYPAL-ORDER-1",
  payment_setting: { id: "ps-paypal", type: "payment_setting_paypals" },
} as unknown as PaymentSession

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [PAYPAL_SETTING],
    payment_sessions: [PAYPAL_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function renderPayPal(currentOrder: Partial<Order> = order()) {
  return render(
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            order: currentOrder,
            include: ["payment_sessions.payment_setting", "payment_sessions.payment_authorization"],
            includeLoaded: {
              "payment_sessions.payment_setting": true,
              "payment_sessions.payment_authorization": true,
            },
            addResourceToInclude: vi.fn(),
            getOrder,
          } as never
        }
      >
        <PaymentSetting>
          <PaymentSettingPayPalPayment className="paypal">
            {({ lastErrorCode, isUnavailable }) => (
              <>
                <span data-testid="paypal-error">{lastErrorCode ?? ""}</span>
                <span data-testid="paypal-unavailable">{isUnavailable ? "yes" : "no"}</span>
              </>
            )}
          </PaymentSettingPayPalPayment>
        </PaymentSetting>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function button(): Element | null {
  return document.querySelector("paypal-button")
}

/** Render, and wait for PayPal's button to be on screen. */
async function renderAvailable() {
  const result = renderPayPal()
  await waitFor(() => {
    expect(button()).not.toBeNull()
  })
  return result
}

/** The promise for the PayPal order that the click handed to `start`. */
function startedOrder(): Promise<{ orderId: string }> {
  return pp.start.mock.calls[0]?.[1]
}

async function approve() {
  await act(async () => {
    await pp.options.onApprove({ orderId: "PAYPAL-ORDER-1" })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  resetPayPalSdk()
  permitted.value = true
  testMode.value = true
  pp.options = null
  pp.isEligible.mockReturnValue(true)
  pp.findEligibleMethods.mockResolvedValue({ isEligible: pp.isEligible })
  pp.start.mockResolvedValue(undefined)
  pp.createInstance.mockResolvedValue({
    findEligibleMethods: pp.findEligibleMethods,
    // biome-ignore lint/suspicious/noExplicitAny: test double for PayPal's session options
    createPayPalOneTimePaymentSession: (options: any) => {
      pp.options = options
      return { start: pp.start, destroy: pp.destroy, cancel: vi.fn() }
    },
  })
  pp.loadCoreSdkScript.mockResolvedValue({ createInstance: pp.createInstance })
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  authorizeMock.mockResolvedValue({ status: "authorized" })
  getOrder.mockResolvedValue(order())
})

describe("<PaymentSettingPayPalPayment> availability", () => {
  it("loads PayPal's SDK under a namespace of its own, for the setting's client id", async () => {
    await renderAvailable()

    // Never the default global, which the Adyen Drop-in's PayPal uses.
    expect(pp.loadCoreSdkScript).toHaveBeenCalledWith({
      environment: "sandbox",
      dataNamespace: "commercelayerPayPal",
    })
    expect(pp.createInstance).toHaveBeenCalledWith({
      clientId: "paypal-client-id",
      components: ["paypal-payments"],
      pageType: "checkout",
    })
    expect(pp.findEligibleMethods).toHaveBeenCalledWith({ currencyCode: "USD" })
  })

  // The same choice Commerce Layer makes when it creates the PayPal order: a
  // sandbox button cannot approve a production order.
  it("talks to PayPal's production for a live organization's token", async () => {
    testMode.value = false
    await renderAvailable()
    expect(pp.loadCoreSdkScript).toHaveBeenCalledWith(
      expect.objectContaining({ environment: "production" })
    )
  })

  it("hands the place button over: PayPal's own button collects", async () => {
    await renderAvailable()
    expect(getHandoffSnapshot("order-1").collection).toEqual({ by: "gateway" })
  })

  it("says it is unavailable, and shows no button, when PayPal is not eligible", async () => {
    pp.isEligible.mockReturnValue(false)
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    renderPayPal()

    await waitFor(() => {
      expect(screen.getByTestId("paypal-unavailable").textContent).toBe("yes")
    })
    expect(button()).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("not offered"))
  })

  it("renders nothing for a setting that is not PayPal's", () => {
    renderPayPal(
      order({
        available_payment_settings: [
          { id: "ps-manual", type: "payment_setting_manuals", name: "Wire" },
        ],
        payment_sessions: [],
      })
    )
    expect(screen.queryByTestId("paypal-error")).toBeNull()
    expect(pp.loadCoreSdkScript).not.toHaveBeenCalled()
  })

  // The PayPal order is created with the session, so there is nothing to
  // approve before the shopper has picked PayPal.
  it("loads nothing until a session exists", () => {
    renderPayPal(order({ payment_sessions: [] }))
    expect(pp.loadCoreSdkScript).not.toHaveBeenCalled()
  })

  it("is skipped by <PaymentSetting> when the setting carries no client id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    renderPayPal(
      order({
        available_payment_settings: [{ ...PAYPAL_SETTING, client_id: undefined }],
      })
    )
    expect(screen.queryByTestId("paypal-error")).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no client_id"))
  })
})

describe("<PaymentSettingPayPalPayment> the click", () => {
  it("opens PayPal at once, on the session's PayPal order once the gift cards are charged", async () => {
    await renderAvailable()

    act(() => {
      fireEvent.click(button() as Element)
    })

    // Synchronously, from the click: the window needs the user's gesture.
    expect(pp.start).toHaveBeenCalledWith({ presentationMode: "auto" }, expect.any(Promise))
    await expect(startedOrder()).resolves.toEqual({ orderId: "PAYPAL-ORDER-1" })
    expect(authorizeGiftCardsMock).toHaveBeenCalledTimes(1)
  })

  it("refuses before the terms are accepted, without opening anything", async () => {
    permitted.value = false
    await renderAvailable()

    act(() => {
      fireEvent.click(button() as Element)
    })

    expect(pp.start).not.toHaveBeenCalled()
    expect(screen.getByTestId("paypal-error").textContent).toBe("TermsNotAccepted")
  })

  it("closes PayPal's window when a gift card is refused, and says why", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ message: "Insufficient balance", meta: { error: "GiftCardRefused" } }],
    })
    pp.start.mockImplementation((_options: unknown, orderPromise: Promise<unknown>) =>
      orderPromise.then(() => undefined)
    )
    await renderAvailable()

    await act(async () => {
      fireEvent.click(button() as Element)
      await startedOrder().catch(() => undefined)
    })
    // PayPal reports the rejected order promise as an error of its own; the
    // gift card is the reason, and stays the one shown.
    act(() => {
      pp.options.onError({ code: "ERR_CREATE_ORDER" })
    })

    await expect(startedOrder()).rejects.toThrow()
    expect(screen.getByTestId("paypal-error").textContent).toBe("GiftCardRefused")
  })

  it("refetches the order once a gift card is charged, so placing skips it", async () => {
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    await renderAvailable()

    act(() => {
      fireEvent.click(button() as Element)
    })
    await startedOrder()

    expect(getOrder).toHaveBeenCalledWith("order-1")
  })
})

describe("<PaymentSettingPayPalPayment> the approval", () => {
  it("authorizes the session and lets the place button finish on its own", async () => {
    await renderAvailable()
    authorizeMock.mockImplementation(async () => {
      // Nothing may delete the session while the money is moving.
      expect(isCollecting("order-1")).toBe(true)
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("in-progress")
      return { status: "authorized" }
    })

    await approve()

    expect(authorizeMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-pp" })
    )
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    expect(isCollecting("order-1")).toBe(false)
  })

  it("reports a refusal as a failed collection carrying PayPal's verdict", async () => {
    authorizeMock.mockResolvedValue({ status: "refused", code: "declined" })
    await renderAvailable()

    await approve()

    const handoff = getHandoffSnapshot("order-1")
    expect(handoff.collectedOutOfBand).toBe("failed")
    expect(handoff.errors[0]?.meta).toEqual({ error: "declined" })
    expect(screen.getByTestId("paypal-error").textContent).toBe("declined")
  })

  it("reports an outcome it cannot know without calling it a refusal", async () => {
    authorizeMock.mockResolvedValue({ status: "unknown", code: "authorization_pending" })
    await renderAvailable()

    await approve()

    const handoff = getHandoffSnapshot("order-1")
    expect(handoff.collectedOutOfBand).toBe("failed")
    expect(handoff.errors[0]?.message).toBe("The payment could not be confirmed.")
  })

  it("moves nothing when the shopper closes PayPal's window", async () => {
    await renderAvailable()

    act(() => {
      pp.options.onCancel({})
    })

    expect(authorizeMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })
})

describe("<PaymentSettingPayPalPayment> teardown", () => {
  it("destroys PayPal's payment session when the button goes away", async () => {
    const { unmount } = await renderAvailable()
    unmount()
    expect(pp.destroy).toHaveBeenCalled()
  })
})
