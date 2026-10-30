import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingBraintreePayPal } from "#components/payment_settings/PaymentSettingBraintreePayPal"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
} from "#utils/paymentGatewayStore"

const NAMESPACE = "commercelayerBraintreePayPal"

/**
 * A fake braintree-web `paypal-checkout` and a fake PayPal SDK behind it.
 *
 * `loadPayPalSDK` installs the SDK under the namespace it was asked for — the
 * behaviour the component relies on to stay clear of the Adyen Drop-in's own
 * PayPal — and `Buttons` records the callbacks, so a test can play PayPal's
 * part: the click, the approval, the cancel.
 */
const pp = vi.hoisted(() => ({
  clientCreate: vi.fn(),
  checkoutCreate: vi.fn(),
  loadPayPalSDK: vi.fn(),
  createPayment: vi.fn(),
  tokenizePayment: vi.fn(),
  teardown: vi.fn(),
  isEligible: vi.fn(),
  renderButtons: vi.fn(),
  closeButtons: vi.fn(),
  // biome-ignore lint/suspicious/noExplicitAny: test double for PayPal's Buttons options
  options: null as any,
}))

vi.mock("braintree-web/client", () => ({ default: { create: pp.clientCreate } }))
vi.mock("braintree-web/paypal-checkout", () => ({ default: { create: pp.checkoutCreate } }))

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

/** The privacy-and-terms gate, which PayPal's own click has to honour. */
const { permitted } = vi.hoisted(() => ({ permitted: { value: true } }))
vi.mock("#hooks/useCollectionPermitted", () => ({
  useCollectionPermitted: () => permitted.value,
  default: () => permitted.value,
}))

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
  currency_code: "EUR",
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
          <PaymentSettingBraintreePayPal className="paypal">
            {({ lastErrorCode }) => <span data-testid="paypal-error">{lastErrorCode ?? ""}</span>}
          </PaymentSettingBraintreePayPal>
        </PaymentSetting>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

/** Render, and wait for the button to have been handed to PayPal. */
async function renderAvailable() {
  const result = renderPayPal()
  await waitFor(() => {
    expect(pp.renderButtons).toHaveBeenCalled()
  })
  return result
}

/** Play the shopper clicking PayPal's button; returns how the click was answered. */
async function click() {
  const actions = { resolve: vi.fn(async () => {}), reject: vi.fn(async () => {}) }
  await act(async () => {
    await pp.options.onClick({}, actions)
  })
  return actions
}

/** Play PayPal approving the payment in its popup. */
async function approve() {
  await act(async () => {
    await pp.options.onApprove({ orderID: "EC-1", payerID: "PAYER-1" })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  permitted.value = true
  pp.options = null
  pp.clientCreate.mockResolvedValue({ name: "client" })
  pp.isEligible.mockReturnValue(true)
  pp.renderButtons.mockResolvedValue(undefined)
  pp.closeButtons.mockResolvedValue(undefined)
  pp.loadPayPalSDK.mockImplementation(
    async (options: { dataAttributes?: { namespace?: string } }) => {
      const namespace = options.dataAttributes?.namespace ?? "paypal"
      ;(globalThis as Record<string, unknown>)[namespace] = {
        FUNDING: { PAYPAL: "paypal" },
        // biome-ignore lint/suspicious/noExplicitAny: test double for PayPal's Buttons options
        Buttons: (buttonOptions: any) => {
          // The eligibility probe passes no callbacks; the real button does.
          if (buttonOptions.onClick != null) pp.options = buttonOptions
          return { isEligible: pp.isEligible, render: pp.renderButtons, close: pp.closeButtons }
        },
      }
    }
  )
  pp.createPayment.mockResolvedValue("EC-1")
  pp.tokenizePayment.mockResolvedValue({ nonce: "paypal-nonce" })
  pp.teardown.mockResolvedValue(undefined)
  pp.checkoutCreate.mockResolvedValue({
    loadPayPalSDK: pp.loadPayPalSDK,
    createPayment: pp.createPayment,
    tokenizePayment: pp.tokenizePayment,
    teardown: pp.teardown,
  })
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  authorizeMock.mockResolvedValue({ status: "authorized" })
  getOrder.mockResolvedValue(order())
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>)[NAMESPACE]
  delete (globalThis as Record<string, unknown>).paypal
})

describe("<PaymentSettingBraintreePayPal> availability", () => {
  it("loads PayPal's SDK for the session's currency, under a namespace of its own", async () => {
    await renderAvailable()

    expect(pp.clientCreate).toHaveBeenCalledWith({ authorization: "client-token-1" })
    expect(pp.loadPayPalSDK).toHaveBeenCalledWith({
      currency: "EUR",
      intent: "authorize",
      dataAttributes: { namespace: NAMESPACE },
    })
    // Never the default global, which the Adyen Drop-in's PayPal uses.
    expect((globalThis as Record<string, unknown>).paypal).toBeUndefined()
  })

  it("renders PayPal's own button, and only PayPal's", async () => {
    const { container } = await renderAvailable()

    expect(pp.options.fundingSource).toBe("paypal")
    expect(pp.renderButtons).toHaveBeenCalledWith(container.querySelector(".paypal"))
  })

  // Most often PayPal is simply not enabled on the Braintree merchant.
  it("renders nothing when Braintree will not create PayPal", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    pp.checkoutCreate.mockRejectedValue({ code: "PAYPAL_NOT_ENABLED" })

    const { container } = renderPayPal()

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("PAYPAL_NOT_ENABLED"))
    })
    expect(container.querySelector(".paypal")).toBeNull()
    warn.mockRestore()
  })

  it("renders nothing when PayPal is not eligible", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    pp.isEligible.mockReturnValue(false)

    const { container } = renderPayPal()

    await waitFor(() => {
      expect(warn).toHaveBeenCalled()
    })
    expect(container.querySelector(".paypal")).toBeNull()
    expect(screen.queryByTestId("paypal-error")).toBeNull()
    warn.mockRestore()
  })

  it("renders nothing until Braintree is the selection", async () => {
    renderPayPal(order({ payment_sessions: [] }))
    await act(async () => {})
    expect(pp.clientCreate).not.toHaveBeenCalled()
  })
})

describe("<PaymentSettingBraintreePayPal> the click", () => {
  // PayPal awaits the click before the popup goes on, so the gate sits here.
  it("closes the popup before the terms are accepted, and says why", async () => {
    permitted.value = false
    await renderAvailable()

    const actions = await click()

    expect(actions.reject).toHaveBeenCalled()
    expect(actions.resolve).not.toHaveBeenCalled()
    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
    expect(screen.getByTestId("paypal-error").textContent).toBe("TermsNotAccepted")
  })

  // Before the money: a refused PayPal payment must never leave gift cards
  // charged after it.
  it("charges the gift cards before letting the popup go on", async () => {
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["session-gc"], errors: [] })
    await renderAvailable()

    const actions = await click()

    expect(authorizeGiftCardsMock).toHaveBeenCalled()
    expect(getOrder).toHaveBeenCalledWith("order-1")
    expect(actions.resolve).toHaveBeenCalled()
  })

  it("closes the popup when a gift card is refused", async () => {
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "The gift card balance is too low." }],
    })
    await renderAvailable()

    const actions = await click()

    expect(actions.reject).toHaveBeenCalled()
    expect(screen.getByTestId("paypal-error").textContent).toBe("GiftCardRefused")
  })

  it("asks PayPal for the session's amount, as an authorization", async () => {
    await renderAvailable()

    await act(async () => {
      await pp.options.createOrder()
    })

    expect(pp.createPayment).toHaveBeenCalledWith({
      flow: "checkout",
      intent: "authorize",
      amount: "51.00",
      currency: "EUR",
    })
  })
})

describe("<PaymentSettingBraintreePayPal> the approval", () => {
  it("hands the nonce to Commerce Layer and lets the place button finish", async () => {
    await renderAvailable()

    await approve()

    expect(pp.tokenizePayment).toHaveBeenCalledWith({ orderID: "EC-1", payerID: "PAYER-1" })
    expect(authorizeMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-bt", nonce: "paypal-nonce" })
    )
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
  })

  it("marks the order as collecting while Braintree answers", async () => {
    await renderAvailable()
    let collecting: boolean | undefined
    authorizeMock.mockImplementation(async () => {
      collecting = isCollecting("order-1")
      return { status: "authorized" }
    })

    await approve()

    expect(collecting).toBe(true)
    expect(isCollecting("order-1")).toBe(false)
  })

  it("hands a refusal to the place button, which burns the session", async () => {
    authorizeMock.mockResolvedValue({ status: "refused", code: "declined" })
    await renderAvailable()

    await approve()

    const handoff = getHandoffSnapshot("order-1")
    expect(handoff.collectedOutOfBand).toBe("failed")
    expect(handoff.errors[0]?.meta).toEqual({ error: "declined" })
  })

  it("goes back to idle when Braintree cannot tokenize the approval", async () => {
    pp.tokenizePayment.mockRejectedValue({ code: "PAYPAL_ACCOUNT_TOKENIZATION_FAILED" })
    await renderAvailable()

    await approve()

    expect(authorizeMock).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
    expect(screen.getByTestId("paypal-error").textContent).toBe(
      "PAYPAL_ACCOUNT_TOKENIZATION_FAILED"
    )
  })

  // Closing the popup moves no money: nothing for the place button to do.
  it("leaves the handoff alone when the popup is closed", async () => {
    await renderAvailable()

    act(() => {
      pp.options.onCancel()
    })

    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
    expect(authorizeMock).not.toHaveBeenCalled()
  })
})
