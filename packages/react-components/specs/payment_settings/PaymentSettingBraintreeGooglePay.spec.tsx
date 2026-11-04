import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingBraintreeGooglePay } from "#components/payment_settings/PaymentSettingBraintreeGooglePay"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { resetPageThreeDSecure } from "#utils/braintree"
import { resetGooglePaymentsApi } from "#utils/googlePay"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
  setCollecting,
} from "#utils/paymentGatewayStore"

/**
 * A fake braintree-web, shallow as in the Apple Pay spec: what is under test
 * is the order in which this component does things around Google's sheet, and
 * what it tells the sheet and the handoff about each outcome.
 */
const bt = vi.hoisted(() => ({
  clientCreate: vi.fn(),
  googlePaymentCreate: vi.fn(),
  createPaymentDataRequest: vi.fn(),
  parseResponse: vi.fn(),
  teardown: vi.fn(),
  threeDSecureCreate: vi.fn(),
  verifyCard: vi.fn(),
}))

vi.mock("braintree-web/client", () => ({ default: { create: bt.clientCreate } }))
vi.mock("braintree-web/google-payment", () => ({ default: { create: bt.googlePaymentCreate } }))
vi.mock("braintree-web/three-d-secure", () => ({ default: { create: bt.threeDSecureCreate } }))

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

/** The privacy-and-terms gate, which Google Pay's own click has to honour. */
const { permitted } = vi.hoisted(() => ({ permitted: { value: true } }))
vi.mock("#hooks/useCollectionPermitted", () => ({
  useCollectionPermitted: () => permitted.value,
  default: () => permitted.value,
}))

const PAYMENT_DATA = { paymentMethodData: { tokenizationData: { token: "google-token" } } }

/**
 * Google's `PaymentsClient`, playing the sheet: `loadPaymentData` hands the
 * shopper's card to `onPaymentAuthorized`, resolves once that answers
 * `SUCCESS`, and stays open — pending — on an `ERROR`, as Google's does.
 */
class FakePaymentsClient {
  static instances: FakePaymentsClient[] = []
  static readyToPay = true

  // biome-ignore lint/suspicious/noExplicitAny: test double for Google's sheet answers
  sheetAnswers: any[] = []
  isReadyToPay = vi.fn(async () => ({ result: FakePaymentsClient.readyToPay }))
  createButton = vi.fn((options: { onClick: () => void }) => {
    const button = document.createElement("button")
    button.setAttribute("aria-label", "Buy with GPay")
    button.addEventListener("click", options.onClick)
    return button
  })
  loadPaymentData = vi.fn(async (_request: unknown) => {
    const answer = await this.options.paymentDataCallbacks.onPaymentAuthorized(PAYMENT_DATA)
    this.sheetAnswers.push(answer)
    if (answer.transactionState === "SUCCESS") return PAYMENT_DATA
    return new Promise(() => {})
  })

  constructor(
    // biome-ignore lint/suspicious/noExplicitAny: test double for Google's options
    public options: any
  ) {
    FakePaymentsClient.instances.push(this)
  }
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
    currency_code: "USD",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [BRAINTREE_SETTING],
    payment_sessions: [BRAINTREE_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function renderGooglePay(
  currentOrder: Partial<Order> = order(),
  props: { googleMerchantId?: string } = {}
) {
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
          <PaymentSettingBraintreeGooglePay merchantName="Acme Store" {...props}>
            {({ lastErrorCode }) => (
              <span data-testid="google-pay-error">{lastErrorCode ?? ""}</span>
            )}
          </PaymentSettingBraintreeGooglePay>
        </PaymentSetting>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

async function renderAvailable(...args: Parameters<typeof renderGooglePay>) {
  const result = renderGooglePay(...args)
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Buy with GPay" })).toBeTruthy()
  })
  return result
}

function paymentsClient(): FakePaymentsClient {
  const client = FakePaymentsClient.instances.at(-1)
  if (client == null) throw new Error("no Google Pay client was created")
  return client
}

/** Press Google's button, and let the sheet play out. */
async function pay() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Buy with GPay" }))
  })
}

/** A card the way Braintree reads it back from Google's token. */
function card(isNetworkTokenized: boolean) {
  return { nonce: "google-pay-nonce", details: { bin: "411111", isNetworkTokenized } }
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  resetPageThreeDSecure()
  resetGooglePaymentsApi()
  permitted.value = true
  FakePaymentsClient.instances = []
  FakePaymentsClient.readyToPay = true
  ;(globalThis as { google?: unknown }).google = {
    payments: { api: { PaymentsClient: FakePaymentsClient } },
  }

  bt.clientCreate.mockResolvedValue({ name: "client" })
  // Braintree's own defaults, with the overrides laid over them.
  bt.createPaymentDataRequest.mockImplementation((overrides: object = {}) => ({
    apiVersion: 2,
    apiVersionMinor: 0,
    environment: "TEST",
    allowedPaymentMethods: [{ type: "CARD", parameters: {} }],
    ...overrides,
  }))
  bt.parseResponse.mockResolvedValue(card(true))
  bt.teardown.mockResolvedValue(undefined)
  bt.googlePaymentCreate.mockResolvedValue({
    createPaymentDataRequest: bt.createPaymentDataRequest,
    parseResponse: bt.parseResponse,
    teardown: bt.teardown,
  })
  bt.threeDSecureCreate.mockResolvedValue({ verifyCard: bt.verifyCard })
  bt.verifyCard.mockResolvedValue({
    nonce: "verified-nonce",
    threeDSecureInfo: { liabilityShifted: true, liabilityShiftPossible: true },
  })
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  authorizeMock.mockResolvedValue({ status: "authorized" })
  getOrder.mockResolvedValue(order())
})

afterEach(() => {
  delete (globalThis as { google?: unknown }).google
})

describe("<PaymentSettingBraintreeGooglePay> availability", () => {
  it("offers Google Pay where the browser and the Braintree merchant can take it", async () => {
    await renderAvailable()
    expect(bt.clientCreate).toHaveBeenCalledWith({ authorization: "client-token-1" })
    expect(bt.googlePaymentCreate).toHaveBeenCalledWith({
      client: { name: "client" },
      googlePayVersion: 2,
      googleMerchantId: undefined,
    })
    // A sandbox merchant pays in Google's test environment.
    expect(paymentsClient().options.environment).toBe("TEST")
  })

  // Most often Google Pay is simply not enabled on the Braintree merchant.
  it("renders nothing when Braintree will not create Google Pay", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    bt.googlePaymentCreate.mockRejectedValue({ code: "GOOGLE_PAYMENT_NOT_ENABLED" })
    renderGooglePay()
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("GOOGLE_PAYMENT_NOT_ENABLED"))
    })
    expect(screen.queryByRole("button")).toBeNull()
    warn.mockRestore()
  })

  it("renders nothing when Google says the browser cannot pay", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    FakePaymentsClient.readyToPay = false
    renderGooglePay()
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("GOOGLE_PAY_NOT_READY"))
    })
    expect(screen.queryByRole("button")).toBeNull()
    warn.mockRestore()
  })

  // Google refuses a production request without its merchant ID.
  it("renders nothing for a production merchant without a Google merchant ID", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    bt.createPaymentDataRequest.mockImplementation((overrides: object = {}) => ({
      apiVersion: 2,
      apiVersionMinor: 0,
      environment: "PRODUCTION",
      allowedPaymentMethods: [{ type: "CARD", parameters: {} }],
      ...overrides,
    }))
    renderGooglePay()
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("GOOGLE_MERCHANT_ID_MISSING"))
    })
    expect(screen.queryByRole("button")).toBeNull()
    warn.mockRestore()
  })

  it("offers Google Pay for a production merchant given a Google merchant ID", async () => {
    bt.createPaymentDataRequest.mockImplementation((overrides: object = {}) => ({
      apiVersion: 2,
      apiVersionMinor: 0,
      environment: "PRODUCTION",
      allowedPaymentMethods: [{ type: "CARD", parameters: {} }],
      ...overrides,
    }))
    await renderAvailable(order(), { googleMerchantId: "google-merchant-1" })
    expect(bt.googlePaymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({ googleMerchantId: "google-merchant-1" })
    )
    expect(paymentsClient().options.environment).toBe("PRODUCTION")
  })

  // The client token is per session, so before the shopper selects there is
  // nothing to boot from.
  it("renders nothing until Braintree is the selection", async () => {
    renderGooglePay(order({ payment_sessions: [] }))
    await act(async () => {})
    expect(screen.queryByRole("button")).toBeNull()
    expect(bt.clientCreate).not.toHaveBeenCalled()
  })
})

describe("<PaymentSettingBraintreeGooglePay> the click", () => {
  it("opens the sheet for the session's amount, cards only, under the store's name", async () => {
    await renderAvailable()

    await pay()

    const [request] = paymentsClient().loadPaymentData.mock.calls[0] as [Record<string, unknown>]
    expect(request).toMatchObject({
      merchantInfo: { merchantName: "Acme Store" },
      allowedPaymentMethods: [{ type: "CARD" }],
      // The session's amount — the remainder after any gift card — not the order total.
      transactionInfo: { currencyCode: "USD", totalPriceStatus: "FINAL", totalPrice: "51.00" },
      callbackIntents: ["PAYMENT_AUTHORIZATION"],
    })
  })

  // The sheet opens only inside the click's gesture, so the gate is checked
  // synchronously, and a refusal opens nothing at all.
  it("opens nothing before the terms are accepted, and says why", async () => {
    permitted.value = false
    await renderAvailable()

    await pay()

    expect(paymentsClient().loadPaymentData).not.toHaveBeenCalled()
    expect(screen.getByTestId("google-pay-error").textContent).toBe("TermsNotAccepted")
  })

  it("treats the shopper closing the sheet as nothing to report", async () => {
    await renderAvailable()
    paymentsClient().loadPaymentData.mockRejectedValueOnce({ statusCode: "CANCELED" })

    await pay()

    expect(screen.getByTestId("google-pay-error").textContent).toBe("")
    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })
})

describe("<PaymentSettingBraintreeGooglePay> the payment", () => {
  it("charges the gift cards in the sheet, then hands the nonce over", async () => {
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(paymentsClient().sheetAnswers).toEqual([{ transactionState: "SUCCESS" }])
    expect(bt.parseResponse).toHaveBeenCalledWith(PAYMENT_DATA)
    expect(authorizeMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-bt", nonce: "google-pay-nonce" })
    )
    // Gift cards before anything reaches Braintree.
    expect(authorizeGiftCardsMock.mock.invocationCallOrder[0]).toBeLessThan(
      bt.parseResponse.mock.invocationCallOrder[0] ?? 0
    )
  })

  it("refetches the order once a gift card has been charged", async () => {
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["session-gc"], errors: [] })
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(getOrder).toHaveBeenCalledWith("order-1")
    })
  })

  // Google keeps its sheet open on an error, so the shopper can try again —
  // and nothing reached Braintree.
  it("reports a refused gift card inside the sheet and charges nothing", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "The gift card balance is too low." }],
    })
    await renderAvailable()

    await pay()

    expect(paymentsClient().sheetAnswers).toEqual([
      {
        transactionState: "ERROR",
        error: {
          intent: "PAYMENT_AUTHORIZATION",
          message: "The gift card balance is too low.",
          reason: "PAYMENT_DATA_INVALID",
        },
      },
    ])
    expect(bt.parseResponse).not.toHaveBeenCalled()
    expect(authorizeMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
    expect(screen.getByTestId("google-pay-error").textContent).toBe("GiftCardRefused")
  })

  it("marks the order as collecting while Braintree answers", async () => {
    await renderAvailable()
    let collectingDuringAuthorization: boolean | undefined
    authorizeMock.mockImplementation(async () => {
      collectingDuringAuthorization = isCollecting("order-1")
      return { status: "authorized" }
    })

    await pay()

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(collectingDuringAuthorization).toBe(true)
    expect(isCollecting("order-1")).toBe(false)
  })

  // A card on a phone pays with the device's cryptogram.
  it("skips 3DS for a network-tokenized card", async () => {
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(authorizeMock).toHaveBeenCalled()
    })
    expect(bt.verifyCard).not.toHaveBeenCalled()
  })

  // A card saved to the Google account pays with the card number itself.
  it("runs 3DS on a card Google holds as a plain card number, and pays with its nonce", async () => {
    bt.parseResponse.mockResolvedValue(card(false))
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(authorizeMock).toHaveBeenCalledWith(
        expect.objectContaining({ nonce: "verified-nonce" })
      )
    })
    expect(bt.verifyCard).toHaveBeenCalledWith(
      expect.objectContaining({ nonce: "google-pay-nonce", bin: "411111", amount: "51.00" })
    )
  })

  // Nothing reached Commerce Layer: the session is intact for another card.
  it("pays nothing when the shopper fails the 3DS challenge", async () => {
    bt.parseResponse.mockResolvedValue(card(false))
    bt.verifyCard.mockResolvedValue({
      nonce: "verified-nonce",
      threeDSecureInfo: {
        liabilityShifted: false,
        liabilityShiftPossible: true,
        status: "authenticate_failed",
      },
    })
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(screen.getByTestId("google-pay-error").textContent).toBe("authenticate_failed")
    })
    expect(authorizeMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("hands a refusal to the place button, which burns the session", async () => {
    authorizeMock.mockResolvedValue({ status: "refused", code: "declined" })
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("failed")
    })
    expect(getHandoffSnapshot("order-1").errors[0]?.meta).toEqual({ error: "declined" })
  })

  // Braintree could not read Google's token: nothing charged, the session
  // intact, and the shopper free to try again.
  it("goes back to idle when Braintree cannot read Google's token", async () => {
    bt.parseResponse.mockRejectedValue({ code: "GOOGLE_PAYMENT_GATEWAY_ERROR" })
    await renderAvailable()

    await pay()

    await waitFor(() => {
      expect(screen.getByTestId("google-pay-error").textContent).toBe(
        "GOOGLE_PAYMENT_GATEWAY_ERROR"
      )
    })
    expect(authorizeMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })
})

describe("<PaymentSettingBraintreeGooglePay> the payment lock", () => {
  // The card form is mid-payment on the same Payment Session.
  it("opens nothing while another route is collecting", async () => {
    await renderAvailable()
    setCollecting("order-1", true)

    await pay()

    expect(paymentsClient().loadPaymentData).not.toHaveBeenCalled()
  })

  it("holds the lock from the click until the sheet is closed", async () => {
    await renderAvailable()
    let closeSheet: (reason: unknown) => void = () => {}
    paymentsClient().loadPaymentData.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          closeSheet = reject
        })
    )

    await pay()
    expect(isCollecting("order-1")).toBe(true)

    await act(async () => {
      closeSheet({ statusCode: "CANCELED" })
    })
    expect(isCollecting("order-1")).toBe(false)
  })

  it("holds the lock while the gift cards are charged", async () => {
    await renderAvailable()
    let collectingDuringGiftCards: boolean | undefined
    authorizeGiftCardsMock.mockImplementation(async () => {
      collectingDuringGiftCards = isCollecting("order-1")
      return { authorizedSessionIds: [], errors: [] }
    })

    await pay()

    expect(collectingDuringGiftCards).toBe(true)
  })

  it("releases the lock when Google cannot open the sheet", async () => {
    await renderAvailable()
    paymentsClient().loadPaymentData.mockRejectedValueOnce({ statusCode: "DEVELOPER_ERROR" })

    await pay()

    expect(isCollecting("order-1")).toBe(false)
    expect(screen.getByTestId("google-pay-error").textContent).toBe("DEVELOPER_ERROR")
  })
})

describe("<PaymentSettingBraintreeGooglePay> a retry in the same sheet", () => {
  const REFUSED = {
    authorizedSessionIds: ["session-gc-small"],
    errors: [{ code: "VALIDATION_ERROR", message: "The gift card balance is too low." }],
  }

  /** The shopper trying again in Google's sheet, which stayed open. */
  async function retryInSheet() {
    await act(async () => {
      await paymentsClient().options.paymentDataCallbacks.onPaymentAuthorized(PAYMENT_DATA)
    })
  }

  // One card charged, the next refused: retried on the order held before, the
  // first card would be charged again.
  it("retries on the order refetched after a partly charged attempt", async () => {
    const refetched = order({ id: "order-1", payment_sessions: [BRAINTREE_SESSION], marker: 2 })
    getOrder.mockResolvedValue(refetched)
    authorizeGiftCardsMock.mockResolvedValueOnce(REFUSED)
    await renderAvailable()

    await pay()
    expect(getOrder).toHaveBeenCalledWith("order-1")

    await retryInSheet()

    expect(authorizeGiftCardsMock).toHaveBeenCalledTimes(2)
    expect(authorizeGiftCardsMock.mock.calls[1]?.[0]).toMatchObject({ order: refetched })
  })

  it("charges nothing more until the order could be refetched", async () => {
    getOrder.mockRejectedValue(new Error("network"))
    authorizeGiftCardsMock.mockResolvedValueOnce(REFUSED)
    await renderAvailable()

    await pay()
    await retryInSheet()

    expect(authorizeGiftCardsMock).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("google-pay-error").textContent).toBe("OrderNotReconciled")
  })

  // An error nobody can read may have come after some cards were charged.
  it("refetches the order after an error it cannot read", async () => {
    authorizeGiftCardsMock.mockRejectedValueOnce(new Error("boom"))
    await renderAvailable()

    await pay()

    expect(getOrder).toHaveBeenCalledWith("order-1")
    expect(paymentsClient().sheetAnswers[0]).toMatchObject({ transactionState: "ERROR" })
  })
})
