import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingCheckoutComApplePay } from "#components/payment_settings/PaymentSettingCheckoutComApplePay"
import { PaymentSettingCheckoutComGooglePay } from "#components/payment_settings/PaymentSettingCheckoutComGooglePay"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
  setCollecting,
} from "#utils/paymentGatewayStore"

/**
 * A fake of Checkout.com's web components: `create` keeps the options it was
 * given, so a test raises Checkout.com's callbacks itself, in the order a real
 * wallet would.
 */
const cko = vi.hoisted(() => ({
  create: vi.fn(),
  available: true,
  component: {
    isAvailable: vi.fn(),
    mount: vi.fn(),
    unmount: vi.fn(),
  },
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  options: null as any,
}))

vi.mock("@checkout.com/checkout-web-components", () => ({
  loadCheckoutWebComponents: () =>
    Promise.resolve({
      create: (name: string, options: unknown) => {
        cko.create(name, options)
        cko.options = options
        return cko.component
      },
    }),
}))

const { record, authorizeGiftCards } = vi.hoisted(() => ({
  record: vi.fn(),
  authorizeGiftCards: vi.fn(),
}))
vi.mock("@commercelayer/core-components", async (original) => ({
  ...(await original<typeof import("@commercelayer/core-components")>()),
  recordCheckoutComPayment: record,
  authorizeGiftCardSessions: authorizeGiftCards,
}))

/** The privacy-and-terms gate, which the wallet's own click has to honour. */
const { permitted } = vi.hoisted(() => ({ permitted: { value: true } }))
vi.mock("#hooks/useCollectionPermitted", () => ({
  useCollectionPermitted: () => permitted.value,
  default: () => permitted.value,
}))

const CKO_SETTING = {
  id: "ps-cko",
  type: "payment_setting_checkout_coms",
  name: "Checkout.com",
  public_key: "pk_sbox_ABC",
} as unknown as PaymentSettingResource

const CKO_SESSION = {
  id: "session-cko",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 7100,
  payment_setting: { id: "ps-cko", type: "payment_setting_checkout_coms" },
  client_data: { success_url: "https://shop/s", failure_url: "https://shop/f" },
  response_data: { id: "ps_1", payment_session_secret: "pss" },
} as unknown as PaymentSession

function order(): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [CKO_SETTING],
    payment_sessions: [CKO_SESSION],
  } as Partial<Order>
}

const getOrder = vi.fn()

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            order: order(),
            include: ["payment_sessions.payment_setting"],
            includeLoaded: { "payment_sessions.payment_setting": true },
            addResourceToInclude: vi.fn(),
            getOrder,
          } as never
        }
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

const captured: { lastErrorCode?: string; isSubmitting?: boolean } = {}

function renderGooglePay() {
  return render(
    <Wrapper>
      <PaymentSetting>
        <PaymentSettingCheckoutComGooglePay className="gpay">
          {({ lastErrorCode, isSubmitting }) => {
            captured.lastErrorCode = lastErrorCode
            captured.isSubmitting = isSubmitting
            return <span data-testid="after-button" />
          }}
        </PaymentSettingCheckoutComGooglePay>
      </PaymentSetting>
    </Wrapper>
  )
}

/** Render, and wait for the wallet's button to be mounted. */
async function renderMounted() {
  const utils = renderGooglePay()
  await waitFor(() => {
    expect(cko.component.mount).toHaveBeenCalled()
  })
  return utils
}

/** The shopper clicks the wallet's button. */
async function click(): Promise<{ continue: boolean }> {
  let answer: { continue: boolean } = { continue: false }
  await act(async () => {
    answer = await cko.options.handleClick(cko.component)
  })
  return answer
}

/** The shopper confirms in the wallet's sheet. */
async function confirm(): Promise<{ continue: boolean; errorMessage?: string }> {
  let answer: { continue: boolean; errorMessage?: string } = { continue: false }
  await act(async () => {
    answer = await cko.options.onAuthorized(cko.component, {})
  })
  return answer
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  permitted.value = true
  cko.options = null
  cko.component.isAvailable.mockResolvedValue(true)
  record.mockResolvedValue(undefined)
  authorizeGiftCards.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  getOrder.mockResolvedValue(order())
  captured.lastErrorCode = undefined
  captured.isSubmitting = undefined
})

describe("<PaymentSettingCheckoutComGooglePay> mounting", () => {
  it("mounts Checkout.com's Google Pay component where it is available", async () => {
    const { getByTestId } = await renderMounted()
    expect(cko.create).toHaveBeenCalledWith("googlepay", expect.anything())
    // Children come after the button, and only with it.
    expect(getByTestId("after-button")).toBeTruthy()
  })

  it("renders nothing where the browser or the session cannot pay with it", async () => {
    cko.component.isAvailable.mockResolvedValue(false)
    const { container } = renderGooglePay()
    await waitFor(() => {
      expect(cko.component.isAvailable).toHaveBeenCalled()
    })
    expect(cko.component.mount).not.toHaveBeenCalled()
    expect(container.querySelector(".gpay")).toBeNull()
  })

  it("registers no collection: the card form keeps the place button", async () => {
    await renderMounted()
    expect(getHandoffSnapshot("order-1").collection).toBeNull()
  })
})

describe("<PaymentSettingCheckoutComApplePay>", () => {
  it("mounts Checkout.com's Apple Pay component", async () => {
    render(
      <Wrapper>
        <PaymentSetting>
          <PaymentSettingCheckoutComApplePay />
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(cko.create).toHaveBeenCalledWith("applepay", expect.anything())
    })
  })
})

describe("<PaymentSettingCheckoutComGooglePay> the click", () => {
  it("opens the sheet without taking the lock", async () => {
    // Checkout.com says nothing when the shopper closes the sheet unpaid, so a
    // lock taken here would never be released.
    await renderMounted()
    expect(await click()).toEqual({ continue: true })
    expect(isCollecting("order-1")).toBe(false)
  })

  it("keeps the sheet closed until the terms are accepted, and says why", async () => {
    permitted.value = false
    await renderMounted()
    expect(await click()).toEqual({ continue: false })
    expect(captured.lastErrorCode).toBe("TermsNotAccepted")
  })

  it("keeps the sheet closed while another payment is under way", async () => {
    await renderMounted()
    setCollecting("order-1", true)
    expect(await click()).toEqual({ continue: false })
  })
})

describe("<PaymentSettingCheckoutComGooglePay> paying", () => {
  it("charges the gift cards once the shopper confirms, before Checkout.com is paid", async () => {
    await renderMounted()
    await click()

    let collectingDuringGiftCards: boolean | undefined
    authorizeGiftCards.mockImplementation(async () => {
      collectingDuringGiftCards = isCollecting("order-1")
      return { authorizedSessionIds: [], errors: [] }
    })

    expect(await confirm()).toEqual({ continue: true })
    expect(authorizeGiftCards).toHaveBeenCalledTimes(1)
    expect(collectingDuringGiftCards).toBe(true)
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("in-progress")
  })

  it("stops the payment on a refused gift card, and lets go of the lock", async () => {
    authorizeGiftCards.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "The gift card balance is too low." }],
    })
    await renderMounted()
    await click()

    expect(await confirm()).toEqual({
      continue: false,
      errorMessage: "The gift card balance is too low.",
    })
    expect(captured.lastErrorCode).toBe("GiftCardRefused")
    expect(isCollecting("order-1")).toBe(false)
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("records the payment and reports it done, for the place button to place", async () => {
    await renderMounted()
    await click()
    await confirm()

    await act(async () => {
      cko.options.onPaymentCompleted(cko.component, { id: "pay_123", status: "Approved" })
    })

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentSessionId: "session-cko",
        clientData: { success_url: "https://shop/s", failure_url: "https://shop/f" },
        paymentId: "pay_123",
      })
    )
    expect(isCollecting("order-1")).toBe(false)
  })

  it("reports a decline out of band, and lets go of the lock", async () => {
    await renderMounted()
    await click()
    await confirm()

    act(() => {
      cko.options.onError(cko.component, {
        type: "Request",
        code: "payment_request_declined",
        message: "Declined",
        details: { requestErrorCodes: ["not_enough_funds"] },
      })
    })

    const handoff = getHandoffSnapshot("order-1")
    expect(handoff.collectedOutOfBand).toBe("failed")
    expect(handoff.errors[0]).toMatchObject({
      resource: "orders",
      meta: { error: "not_enough_funds" },
    })
    expect(isCollecting("order-1")).toBe(false)
  })

  it("reports a payment it could not record as failed, never as done", async () => {
    record.mockRejectedValueOnce(new Error("network"))
    await renderMounted()
    await click()
    await confirm()

    await act(async () => {
      cko.options.onPaymentCompleted(cko.component, { id: "pay_123", status: "Approved" })
    })

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("failed")
    })
    expect(getHandoffSnapshot("order-1").errors[0]).toMatchObject({
      meta: { error: "payment_not_recorded" },
    })
  })

  it("says nothing to the place button about an error outside a payment", async () => {
    await renderMounted()
    act(() => {
      cko.options.onError(cko.component, {
        type: "Integration",
        code: "payment_session_invalid",
        message: "Invalid",
        details: {},
      })
    })
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("lets go of the lock if the button goes away mid-payment", async () => {
    const { unmount } = await renderMounted()
    await click()
    await confirm()
    expect(isCollecting("order-1")).toBe(true)

    unmount()

    expect(isCollecting("order-1")).toBe(false)
    expect(cko.component.unmount).toHaveBeenCalled()
  })

  it("refuses a sheet confirmed after the button went away", async () => {
    const { unmount } = await renderMounted()
    await click()
    unmount()

    expect(await confirm()).toMatchObject({ continue: false })
    expect(authorizeGiftCards).not.toHaveBeenCalled()
  })
})
