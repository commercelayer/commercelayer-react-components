import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingCheckoutComPayment } from "#components/payment_settings/PaymentSettingCheckoutComPayment"
import { PaymentSettingRadioButton } from "#components/payment_settings/PaymentSettingRadioButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  getHandoffSnapshot,
  isCollecting,
  resetPaymentGatewayStore,
} from "#utils/paymentGatewayStore"

/**
 * A fake of Checkout.com's web components, deliberately shallow.
 *
 * `create` hands back a component whose methods the tests drive, and keeps the
 * options it was given, so a test can raise Checkout.com's callbacks itself.
 * What is under test is our mapping from those callbacks to the handoff's
 * outcomes, which is the only part of this component that carries a decision.
 */
const cko = vi.hoisted(() => ({
  load: vi.fn(),
  create: vi.fn(),
  component: {
    isValid: vi.fn(),
    isAvailable: vi.fn(),
    submit: vi.fn(),
    mount: vi.fn(),
    unmount: vi.fn(),
  },
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  options: null as any,
}))

vi.mock("@checkout.com/checkout-web-components", () => ({
  loadCheckoutWebComponents: (options: unknown) => {
    cko.load(options)
    return Promise.resolve({
      create: (name: string, options: unknown) => {
        cko.create(name, options)
        cko.options = options
        return cko.component
      },
    })
  },
}))

const record = vi.hoisted(() => vi.fn())
vi.mock("@commercelayer/core-components", async (original) => ({
  ...(await original<typeof import("@commercelayer/core-components")>()),
  recordCheckoutComPayment: record,
}))

const CKO_SETTING = {
  id: "ps-cko",
  type: "payment_setting_checkout_coms",
  name: "Checkout.com",
  public_key: "pk_sbox_ABC",
} as unknown as PaymentSettingResource

const CKO_PAYMENT_SESSION = {
  id: "ps_2Un0Ag",
  payment_session_secret: "pss_secret",
  payment_session_token: "token",
}

const CKO_SESSION = {
  id: "session-cko",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 7100,
  payment_setting: { id: "ps-cko", type: "payment_setting_checkout_coms" },
  client_data: { success_url: "https://shop/s", failure_url: "https://shop/f" },
  response_data: CKO_PAYMENT_SESSION,
} as unknown as PaymentSession

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [CKO_SETTING],
    payment_sessions: [CKO_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function Wrapper({
  children,
  currentOrder,
}: {
  children: ReactNode
  currentOrder: Partial<Order>
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            order: currentOrder,
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

function renderCheckoutCom(currentOrder: Partial<Order> = order()) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingCheckoutComPayment containerClassName="cko" />
      </PaymentSetting>
    </Wrapper>
  )
}

/** Render, and wait for the card component to be mounted. */
async function renderMounted() {
  const utils = renderCheckoutCom()
  await waitFor(() => {
    expect(cko.component.mount).toHaveBeenCalled()
  })
  return utils
}

/** The host collection this component is expected to have registered. */
function hostSubmit() {
  const { collection } = getHandoffSnapshot("order-1")
  if (collection?.by !== "host") {
    throw new Error(`expected a host collection, got ${JSON.stringify(collection)}`)
  }
  return collection.submit
}

/**
 * Start a payment, and answer it the way Checkout.com would once `submit()` is
 * called.
 */
async function pay(answer: () => void) {
  cko.component.submit.mockImplementationOnce(() => {
    answer()
  })
  let result: unknown
  await act(async () => {
    result = await hostSubmit()()
  })
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  cko.options = null
  cko.component.isValid.mockReturnValue(true)
  cko.component.isAvailable.mockResolvedValue(true)
  cko.component.submit.mockImplementation(() => {})
  record.mockResolvedValue(undefined)
  getOrder.mockResolvedValue(order())
})

describe("<PaymentSettingCheckoutComPayment> mounting", () => {
  it("mounts the card component on the session's Checkout.com payment session", async () => {
    await renderMounted()

    expect(cko.load).toHaveBeenCalledWith(
      expect.objectContaining({
        publicKey: "pk_sbox_ABC",
        paymentSession: CKO_PAYMENT_SESSION,
        environment: "sandbox",
      })
    )
    // The card component, not Flow: Flow would bring wallets with buttons of
    // their own, which the place-order button cannot press.
    expect(cko.create).toHaveBeenCalledWith("card", expect.anything())
    expect(cko.options.showPayButton).toBe(false)
  })

  it("leaves the pay button to <PlaceOrderButton>", async () => {
    await renderMounted()
    expect(getHandoffSnapshot("order-1").collection?.by).toBe("host")
  })

  it("renders nothing for a setting that is not Checkout.com's", () => {
    const { container } = renderCheckoutCom(
      order({
        available_payment_settings: [
          { id: "ps-manual", type: "payment_setting_manuals", name: "Wire" },
        ],
        payment_sessions: [],
      })
    )
    expect(container.querySelector(".cko")).toBeNull()
    expect(cko.load).not.toHaveBeenCalled()
  })

  it("reports the form ready as Checkout.com says it is", async () => {
    await renderMounted()
    const collection = () => getHandoffSnapshot("order-1").collection

    act(() => {
      cko.options.onChange({ isValid: () => true })
    })
    expect(collection()).toMatchObject({ by: "host", isReady: true })

    act(() => {
      cko.options.onChange({ isValid: () => false })
    })
    expect(collection()).toMatchObject({ by: "host", isReady: false })
  })
})

describe("<PaymentSettingCheckoutComPayment> collecting", () => {
  it("records the approved payment on the session, then reports it completed", async () => {
    // The authorization the place sequence creates next reads the payment from
    // `client_data.payment_method`, so it has to be there first.
    await renderMounted()

    const result = await pay(() => {
      cko.options.onPaymentCompleted(cko.component, { id: "pay_123", status: "Approved" })
    })

    expect(result).toEqual({ status: "completed" })
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token",
        paymentSessionId: "session-cko",
        clientData: { success_url: "https://shop/s", failure_url: "https://shop/f" },
        paymentId: "pay_123",
      })
    )
  })

  it("marks the order as collecting while Checkout.com has the shopper", async () => {
    await renderMounted()

    let collectingDuringSubmit: boolean | undefined
    await pay(() => {
      collectingDuringSubmit = isCollecting("order-1")
      cko.options.onPaymentCompleted(cko.component, { id: "pay_123", status: "Approved" })
    })

    expect(collectingDuringSubmit).toBe(true)
    expect(isCollecting("order-1")).toBe(false)
  })

  it("stops on an incomplete form, letting the form show what is missing", async () => {
    await renderMounted()
    cko.component.isValid.mockReturnValue(false)

    let result: unknown
    await act(async () => {
      result = await hostSubmit()()
    })

    expect(result).toEqual({ status: "incomplete" })
    // Submitting is what makes the card component flag its empty fields.
    expect(cko.component.submit).toHaveBeenCalledTimes(1)
    expect(isCollecting("order-1")).toBe(false)
    expect(record).not.toHaveBeenCalled()
  })

  it("reports a decline as a failure, with Checkout.com's reason", async () => {
    await renderMounted()

    const result = await pay(() => {
      cko.options.onError(cko.component, {
        type: "Request",
        code: "payment_request_declined",
        message: "Declined",
        details: { requestErrorCodes: ["not_enough_funds"] },
      })
    })

    expect(result).toEqual({ status: "failed", code: "not_enough_funds" })
    expect(record).not.toHaveBeenCalled()
  })

  it("reports a request that failed midway as unknown", async () => {
    // The payment may have reached Checkout.com, so nothing may be rolled back.
    await renderMounted()

    const result = await pay(() => {
      cko.options.onError(cko.component, {
        type: "Request",
        code: "payment_request_failed",
        message: "Failed",
        details: {},
      })
    })

    expect(result).toEqual({ status: "unknown", code: "payment_request_failed" })
  })

  it("treats a Submit error during a payment as an incomplete form", async () => {
    await renderMounted()

    const result = await pay(() => {
      cko.options.onError(cko.component, {
        type: "Submit",
        code: "component_invalid",
        message: "Invalid",
        details: {},
      })
    })

    expect(result).toEqual({ status: "incomplete" })
  })

  it("never submits an approved payment twice when recording it failed", async () => {
    // The money is taken. A second `submit()` would take it again, so the next
    // click retries the write instead.
    await renderMounted()
    record.mockRejectedValueOnce(new Error("network"))

    const first = await pay(() => {
      cko.options.onPaymentCompleted(cko.component, { id: "pay_123", status: "Approved" })
    })
    expect(first).toEqual({ status: "unknown", code: "payment_not_recorded" })

    let second: unknown
    await act(async () => {
      second = await hostSubmit()()
    })

    expect(second).toEqual({ status: "completed" })
    expect(cko.component.submit).toHaveBeenCalledTimes(1)
    expect(record).toHaveBeenCalledTimes(2)
    expect(record).toHaveBeenLastCalledWith(expect.objectContaining({ paymentId: "pay_123" }))
  })

  it("settles a payment in flight as unknown when the form goes away", async () => {
    // A button waiting on a form that no longer exists would wait forever.
    const { unmount } = await renderMounted()
    const submit = hostSubmit()

    let result: unknown
    let settled: Promise<void> = Promise.resolve()
    act(() => {
      settled = submit().then((value) => {
        result = value
      })
    })
    unmount()
    await act(async () => {
      await settled
    })

    expect(result).toEqual({ status: "unknown", code: "component_unmounted" })
    expect(cko.component.unmount).toHaveBeenCalled()
  })
})
