import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingBraintreeApplePay } from "#components/payment_settings/PaymentSettingBraintreeApplePay"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
} from "#utils/paymentGatewayStore"

/**
 * A fake braintree-web, shallow as in the card spec: what is under test is the
 * order in which this component does things inside Apple's callbacks, and what
 * it tells the sheet and the handoff about each outcome.
 */
const bt = vi.hoisted(() => ({
  clientCreate: vi.fn(),
  applePayCreate: vi.fn(),
  createPaymentRequest: vi.fn(),
  performValidation: vi.fn(),
  tokenize: vi.fn(),
  teardown: vi.fn(),
}))

vi.mock("braintree-web/client", () => ({ default: { create: bt.clientCreate } }))
vi.mock("braintree-web/apple-pay", () => ({ default: { create: bt.applePayCreate } }))

const { authorizeMock, authorizeGiftCardsMock } = vi.hoisted(() => ({
  authorizeMock: vi.fn(),
  authorizeGiftCardsMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    authorizeBraintreePaymentSession: authorizeMock,
    authorizeGiftCardSessions: authorizeGiftCardsMock,
  }
})

/** The privacy-and-terms gate, which Apple Pay's own click has to honour. */
const { permitted } = vi.hoisted(() => ({ permitted: { value: true } }))
vi.mock("#hooks/useCollectionPermitted", () => ({
  useCollectionPermitted: () => permitted.value,
  default: () => permitted.value,
}))

/**
 * Safari's `ApplePaySession`, recording what it was asked and exposing the
 * handlers this component installs, so a test can play Apple's part.
 */
class FakeApplePaySession {
  static STATUS_SUCCESS = 0
  static STATUS_FAILURE = 1
  static supportsVersion = vi.fn(() => true)
  static canMakePayments = vi.fn(() => true)
  static instances: FakeApplePaySession[] = []

  // biome-ignore lint/suspicious/noExplicitAny: test double for Apple's event handlers
  onvalidatemerchant: ((event: any) => void) | null = null
  // biome-ignore lint/suspicious/noExplicitAny: test double for Apple's event handlers
  onpaymentauthorized: ((event: any) => void) | null = null
  begin = vi.fn()
  abort = vi.fn()
  completeMerchantValidation = vi.fn()
  completePayment = vi.fn()

  constructor(
    public version: number,
    public request: unknown
  ) {
    FakeApplePaySession.instances.push(this)
  }
}

class FakeApplePayError {
  constructor(
    public code: string,
    public contactField?: string,
    public message?: string
  ) {}
}

const BRAINTREE_SETTING = {
  id: "ps-braintree",
  type: "payment_setting_braintrees",
  name: "Braintree",
} as unknown as PaymentSettingResource

const BRAINTREE_SESSION = {
  id: "session-bt",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 5100,
  amount_float: 51,
  payment_setting: { id: "ps-braintree", type: "payment_setting_braintrees" },
  response_data: { clientToken: "client-token-1" },
} as unknown as PaymentSession

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [BRAINTREE_SETTING],
    payment_sessions: [BRAINTREE_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function renderApplePay(currentOrder: Partial<Order> = order()) {
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
          <PaymentSettingBraintreeApplePay displayName="Acme Store" className="apple-pay">
            {({ lastErrorCode }) => (
              <span data-testid="apple-pay-error">{lastErrorCode ?? ""}</span>
            )}
          </PaymentSettingBraintreeApplePay>
        </PaymentSetting>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

async function renderAvailable() {
  const result = renderApplePay()
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Pay with Apple Pay" })).toBeTruthy()
  })
  return result
}

/** Tap the button and return the sheet it began. */
function tap(): FakeApplePaySession {
  fireEvent.click(screen.getByRole("button", { name: "Pay with Apple Pay" }))
  const sheet = FakeApplePaySession.instances.at(-1)
  if (sheet == null) throw new Error("no Apple Pay session was created")
  return sheet
}

/** Play the shopper authorizing in the sheet, and wait for the component's answer. */
async function authorizeIn(sheet: FakeApplePaySession) {
  await act(async () => {
    sheet.onpaymentauthorized?.({ payment: { token: { paymentData: "apple-token" } } })
  })
  await waitFor(() => {
    expect(sheet.completePayment).toHaveBeenCalled()
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  permitted.value = true
  FakeApplePaySession.instances = []
  FakeApplePaySession.supportsVersion.mockReturnValue(true)
  FakeApplePaySession.canMakePayments.mockReturnValue(true)
  ;(globalThis as { ApplePaySession?: unknown }).ApplePaySession = FakeApplePaySession
  ;(globalThis as { ApplePayError?: unknown }).ApplePayError = FakeApplePayError

  bt.clientCreate.mockResolvedValue({ name: "client" })
  bt.createPaymentRequest.mockImplementation((request: object) => ({
    ...request,
    countryCode: "US",
    currencyCode: "USD",
  }))
  bt.performValidation.mockResolvedValue({ merchantSession: "opaque" })
  bt.tokenize.mockResolvedValue({ nonce: "apple-pay-nonce" })
  bt.teardown.mockResolvedValue(undefined)
  bt.applePayCreate.mockResolvedValue({
    createPaymentRequest: bt.createPaymentRequest,
    performValidation: bt.performValidation,
    tokenize: bt.tokenize,
    teardown: bt.teardown,
  })
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  authorizeMock.mockResolvedValue({ status: "authorized" })
  getOrder.mockResolvedValue(order())
})

afterEach(() => {
  delete (globalThis as { ApplePaySession?: unknown }).ApplePaySession
  delete (globalThis as { ApplePayError?: unknown }).ApplePayError
})

describe("<PaymentSettingBraintreeApplePay> availability", () => {
  it("offers Apple Pay where the browser and the Braintree merchant can take it", async () => {
    await renderAvailable()
    expect(bt.clientCreate).toHaveBeenCalledWith({ authorization: "client-token-1" })
    expect(bt.applePayCreate).toHaveBeenCalledWith({ client: { name: "client" } })
  })

  it("renders nothing on a browser without Apple Pay", async () => {
    delete (globalThis as { ApplePaySession?: unknown }).ApplePaySession
    renderApplePay()
    await act(async () => {})
    expect(screen.queryByRole("button")).toBeNull()
    expect(bt.clientCreate).not.toHaveBeenCalled()
  })

  it("renders nothing on a device that cannot pay", async () => {
    FakeApplePaySession.canMakePayments.mockReturnValue(false)
    renderApplePay()
    await act(async () => {})
    expect(screen.queryByRole("button")).toBeNull()
  })

  // Most often Apple Pay is simply not enabled on the Braintree merchant.
  it("renders nothing when Braintree will not create Apple Pay", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    bt.applePayCreate.mockRejectedValue({ code: "APPLE_PAY_NOT_ENABLED" })
    renderApplePay()
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("APPLE_PAY_NOT_ENABLED"))
    })
    expect(screen.queryByRole("button")).toBeNull()
    warn.mockRestore()
  })

  // The client token is per session, so before the shopper selects there is
  // nothing to boot from — and a payment taken on an unselected setting would
  // be taken on a session that is not the order's selection.
  it("renders nothing until Braintree is the selection", async () => {
    renderApplePay(order({ payment_sessions: [] }))
    await act(async () => {})
    expect(screen.queryByRole("button")).toBeNull()
    expect(bt.clientCreate).not.toHaveBeenCalled()
  })
})

describe("<PaymentSettingBraintreeApplePay> the click", () => {
  it("opens the sheet for the session's amount, under the store's name", async () => {
    await renderAvailable()

    const sheet = tap()

    expect(sheet.version).toBe(3)
    // The session's amount — the remainder after any gift card — not the order total.
    expect(bt.createPaymentRequest).toHaveBeenCalledWith({
      total: { label: "Acme Store", amount: "51.00" },
    })
    expect(sheet.begin).toHaveBeenCalled()
  })

  // The sheet has to be begun inside the click's gesture, so the gate is
  // checked synchronously, and a refusal opens nothing at all.
  it("opens nothing before the terms are accepted, and says why", async () => {
    permitted.value = false
    await renderAvailable()

    fireEvent.click(screen.getByRole("button", { name: "Pay with Apple Pay" }))

    expect(FakeApplePaySession.instances).toHaveLength(0)
    expect(screen.getByTestId("apple-pay-error").textContent).toBe("TermsNotAccepted")
  })

  it("validates the merchant through Braintree", async () => {
    await renderAvailable()
    const sheet = tap()

    await act(async () => {
      sheet.onvalidatemerchant?.({ validationURL: "https://apple-pay-gateway.apple.com/x" })
    })

    expect(bt.performValidation).toHaveBeenCalledWith({
      validationURL: "https://apple-pay-gateway.apple.com/x",
      displayName: "Acme Store",
    })
    expect(sheet.completeMerchantValidation).toHaveBeenCalledWith({ merchantSession: "opaque" })
  })

  // An unregistered domain ends here, after the tap: nothing has moved yet.
  it("closes the sheet when merchant validation fails", async () => {
    bt.performValidation.mockRejectedValue({ code: "APPLE_PAY_MERCHANT_VALIDATION_FAILED" })
    await renderAvailable()
    const sheet = tap()

    await act(async () => {
      sheet.onvalidatemerchant?.({ validationURL: "https://apple-pay-gateway.apple.com/x" })
    })

    expect(sheet.abort).toHaveBeenCalled()
    expect(screen.getByTestId("apple-pay-error").textContent).toBe(
      "APPLE_PAY_MERCHANT_VALIDATION_FAILED"
    )
  })
})

describe("<PaymentSettingBraintreeApplePay> the payment", () => {
  it("charges the gift cards, then hands the nonce over, then completes the sheet", async () => {
    await renderAvailable()
    const sheet = tap()

    await authorizeIn(sheet)

    expect(bt.tokenize).toHaveBeenCalledWith({ token: { paymentData: "apple-token" } })
    expect(authorizeMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-bt", nonce: "apple-pay-nonce" })
    )
    // Gift cards before anything reaches Braintree.
    expect(authorizeGiftCardsMock.mock.invocationCallOrder[0]).toBeLessThan(
      bt.tokenize.mock.invocationCallOrder[0] ?? 0
    )
    expect(sheet.completePayment).toHaveBeenCalledWith({ status: 0 })
    // Nobody pressed the place button: it places the order on its own.
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
  })

  it("refetches the order once a gift card has been charged", async () => {
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["session-gc"], errors: [] })
    await renderAvailable()

    await authorizeIn(tap())

    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("marks the order as collecting while Braintree answers", async () => {
    await renderAvailable()
    let collectingDuringAuthorization: boolean | undefined
    authorizeMock.mockImplementation(async () => {
      collectingDuringAuthorization = isCollecting("order-1")
      return { status: "authorized" }
    })

    await authorizeIn(tap())

    expect(collectingDuringAuthorization).toBe(true)
    expect(isCollecting("order-1")).toBe(false)
  })

  // Apple keeps its sheet open on a failure, so the shopper can try again —
  // and nothing reached Braintree.
  it("reports a refused gift card inside the sheet and charges nothing", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "The gift card balance is too low." }],
    })
    await renderAvailable()
    const sheet = tap()

    await authorizeIn(sheet)

    const [answer] = sheet.completePayment.mock.calls[0] as [
      { status: number; errors: FakeApplePayError[] },
    ]
    expect(answer.status).toBe(1)
    expect(answer.errors[0]).toBeInstanceOf(FakeApplePayError)
    expect(answer.errors[0]?.message).toBe("The gift card balance is too low.")
    expect(bt.tokenize).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("hands a refusal to the place button, which burns the session", async () => {
    authorizeMock.mockResolvedValue({ status: "refused", code: "declined" })
    await renderAvailable()
    const sheet = tap()

    await authorizeIn(sheet)

    expect(sheet.completePayment).toHaveBeenCalledWith(expect.objectContaining({ status: 1 }))
    const handoff = getHandoffSnapshot("order-1")
    expect(handoff.collectedOutOfBand).toBe("failed")
    expect(handoff.errors[0]?.meta).toEqual({ error: "declined" })
  })

  // Braintree could not read Apple's token: nothing charged, the session
  // intact, and the shopper free to try again.
  it("goes back to idle when Braintree cannot tokenize", async () => {
    bt.tokenize.mockRejectedValue({ code: "APPLE_PAY_TOKENIZATION" })
    await renderAvailable()

    await authorizeIn(tap())

    expect(authorizeMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
    expect(screen.getByTestId("apple-pay-error").textContent).toBe("APPLE_PAY_TOKENIZATION")
  })

  // Apple closes a sheet that took too long, and completing it then throws —
  // the outcome still has to reach the order.
  it("reports the outcome even when the sheet has already closed", async () => {
    await renderAvailable()
    const sheet = tap()
    sheet.completePayment.mockImplementation(() => {
      throw new Error("InvalidStateError")
    })

    await authorizeIn(sheet)

    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
  })
})
