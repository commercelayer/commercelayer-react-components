import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingAdyenPayment } from "#components/payment_settings/PaymentSettingAdyenPayment"
import { PaymentSettingRadioButton } from "#components/payment_settings/PaymentSettingRadioButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { getHandoffSnapshot, resetPaymentGatewayStore } from "#utils/paymentGatewayStore"

const adyen = vi.hoisted(() => ({
  dropinMount: vi.fn(),
  dropinRemove: vi.fn(),
  dropinSubmit: vi.fn(),
  isValid: true,
  // The Core and Drop-in configuration the component builds, so tests can
  // invoke the very callbacks it installed.
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  captured: { options: null as any, dropinOptions: null as any },
}))

vi.mock("@adyen/adyen-web/auto", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  AdyenCheckout: vi.fn(async (options: any) => {
    adyen.captured.options = options
    return { submitDetails: vi.fn(), remove: vi.fn() }
  }),
  Dropin: class FakeDropin {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    constructor(_core: any, options: any) {
      adyen.captured.dropinOptions = options
    }
    get isValid(): boolean {
      return adyen.isValid
    }
    mount(node: unknown): this {
      adyen.dropinMount(node)
      return this
    }
    submit(): void {
      adyen.dropinSubmit()
    }
    remove(): void {
      adyen.dropinRemove()
    }
  },
}))

const { createPaymentSessionMock, discardPaymentSessionMock } = vi.hoisted(() => ({
  createPaymentSessionMock: vi.fn(),
  discardPaymentSessionMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    createPaymentSession: createPaymentSessionMock,
    discardPaymentSession: discardPaymentSessionMock,
  }
})

// `paymentSettingCreateAttributes` decides the tokenization variant from the
// token, and the test token is not a real JWT.
vi.mock("#utils/isGuestToken", () => ({ isGuestToken: () => true }))

// Cast where the fixture is defined, as the core specs do, rather than at
// every call site: `available_payment_settings` is the six-member per-provider
// union, and a literal without `created_at`/`updated_at` matches none of them.
const ADYEN_SETTING = {
  id: "ps-adyen",
  type: "payment_setting_adyens",
  name: "Adyen",
  public_key: "test_ABC123",
} as unknown as PaymentSettingResource

const ADYEN_SESSION = {
  id: "session-adyen",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 7100,
  payment_setting: { id: "ps-adyen", type: "payment_setting_adyens" },
  response_data: { id: "CS-1", sessionData: "blob-1" },
} as unknown as PaymentSession

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [ADYEN_SETTING],
    payment_sessions: [ADYEN_SESSION],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function Wrapper({
  children,
  currentOrder,
}: {
  children: ReactNode
  currentOrder?: Partial<Order> | null
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            order: currentOrder ?? undefined,
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
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderAdyen(currentOrder: Partial<Order> | null = order()) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingAdyenPayment containerClassName="dropin" />
      </PaymentSetting>
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  adyen.isValid = true
  adyen.captured.options = null
  adyen.captured.dropinOptions = null
  createPaymentSessionMock.mockResolvedValue({ id: "session-new" })
  discardPaymentSessionMock.mockResolvedValue(true)
  getOrder.mockResolvedValue(order())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("<PaymentSettingAdyenPayment> mounting", () => {
  it("builds the Drop-in from the Adyen Session on the order", async () => {
    renderAdyen()

    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    })
    expect(adyen.captured.options.session).toEqual({ id: "CS-1", sessionData: "blob-1" })
    expect(adyen.captured.options.clientKey).toBe("test_ABC123")
  })

  it("suppresses Adyen's own Pay button, on the Core and not on the Drop-in", async () => {
    // The Drop-in forwards only `{ elementRef, isDropin }` to its children, so
    // setting it on the Drop-in would visibly do nothing.
    renderAdyen()

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.showPayButton).toBe(false)
    expect(adyen.captured.dropinOptions.showPayButton).toBeUndefined()
  })

  it("offers cards only", async () => {
    // Apple Pay, Google Pay and PayPal render their own pay buttons and submit
    // themselves, which would bypass the place-order button and the terms gate.
    renderAdyen()

    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.allowPaymentMethods).toEqual(["scheme"])
  })

  it("disables the final animation, since a refusal replaces the session", async () => {
    renderAdyen()

    await waitFor(() => {
      expect(adyen.captured.dropinOptions).not.toBeNull()
    })
    expect(adyen.captured.dropinOptions.disableFinalAnimation).toBe(true)
  })

  it("derives the environment from the Client Key prefix", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })
    expect(adyen.captured.options.environment).toBe("test")
  })

  it("still renders its container when a function child is given", async () => {
    // The Drop-in mounts into that element. If a render prop replaced it — as
    // it does elsewhere in the library — an application that forgot to render
    // the container would get a payment form that silently never appears.
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingAdyenPayment containerClassName="dropin">
            {({ isSubmitting }) => (
              <span data-testid="chrome">{isSubmitting ? "paying" : "idle"}</span>
            )}
          </PaymentSettingAdyenPayment>
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByTestId("chrome").textContent).toBe("idle")
  })

  it("does not mount without an Adyen Session on the order", async () => {
    // What a `fields` allowlist that omits `response_data` produces.
    renderAdyen(order({ payment_sessions: [{ ...ADYEN_SESSION, response_data: null }] }))

    await waitFor(() => {
      expect(screen.getByTestId("radio")).toBeTruthy()
    })
    expect(adyen.dropinMount).not.toHaveBeenCalled()
  })
})

describe("<PaymentSetting> skipping unusable Adyen settings", () => {
  it("skips a setting with no public_key", async () => {
    // Optional and unvalidated server-side, so a setting that charges fine
    // server-side can carry none — and then the Drop-in cannot boot. A radio
    // button that does nothing is worse than no radio button.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    renderAdyen(order({ available_payment_settings: [{ ...ADYEN_SETTING, public_key: null }] }))

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no public_key"))
    })
    expect(screen.queryByTestId("radio")).toBeNull()
  })

  it("skips a disabled setting", async () => {
    // `available_payment_settings` has no `.enabled` filter, unlike the older
    // model's `available_payment_methods`.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    renderAdyen(
      order({
        available_payment_settings: [{ ...ADYEN_SETTING, disabled_at: "2026-09-01T00:00:00Z" }],
      })
    )

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("is disabled"))
    })
    expect(screen.queryByTestId("radio")).toBeNull()
  })
})

describe("the Payment Gateway Handoff", () => {
  it("registers a submit the place-order button can call", async () => {
    renderAdyen()

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").submit).not.toBeNull()
    })
  })

  it("resolves as completed when Adyen reports the payment taken", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = getHandoffSnapshot("order-1").submit
    let result: unknown
    await act(async () => {
      const pending = submit?.().then((r) => {
        result = r
      })
      // The Drop-in charges the card and answers through the callback the
      // component installed, not through the return value of `submit()`.
      adyen.captured.options.onPaymentCompleted({ resultCode: "Authorised" })
      await pending
    })

    expect(adyen.dropinSubmit).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ status: "completed" })
  })

  it("reports an invalid form as incomplete without submitting a payment", async () => {
    // `dropin.submit()` shows its own validation and no-ops, settling nothing,
    // so the guard is what stops the caller waiting forever.
    adyen.isValid = false
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = getHandoffSnapshot("order-1").submit
    const result = await act(async () => await submit?.())

    expect(result).toEqual({ status: "incomplete" })
    expect(adyen.dropinSubmit).toHaveBeenCalledTimes(1)
  })

  it("carries Adyen's resultCode as the failure code, with no copy of its own", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = getHandoffSnapshot("order-1").submit
    let result: unknown
    await act(async () => {
      const pending = submit?.().then((r) => {
        result = r
      })
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
      await pending
    })

    expect(result).toEqual({ status: "failed", code: "Refused" })
  })

  it("reports a network or SDK error as unknown, so nothing is rolled back", async () => {
    // The payment may have gone through: refunding gift cards here could take
    // back money for a card that did charge.
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    const submit = getHandoffSnapshot("order-1").submit
    let result: unknown
    await act(async () => {
      const pending = submit?.().then((r) => {
        result = r
      })
      adyen.captured.options.onError({ name: "NETWORK_ERROR", message: "boom" })
      await pending
    })

    expect(result).toEqual({ status: "unknown", code: "NETWORK_ERROR" })
  })

  it("publishes readiness from the Drop-in's own validity", async () => {
    renderAdyen()
    await waitFor(() => {
      expect(adyen.captured.options).not.toBeNull()
    })

    await act(async () => {
      adyen.captured.options.onChange({ isValid: true })
    })
    expect(getHandoffSnapshot("order-1").isReady).toBe(true)

    await act(async () => {
      adyen.captured.options.onChange({ isValid: false })
    })
    expect(getHandoffSnapshot("order-1").isReady).toBe(false)
  })
})

describe("what this component does NOT do on a refusal", () => {
  it("leaves replacing the burnt Payment Session to the place-order button", async () => {
    // Not an oversight. The button also decides whether the gift cards are
    // given back, and that changes what is left to pay — so a replacement
    // created here would be sized for the wrong amount.
    renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalled()
    })

    await act(async () => {
      adyen.captured.options.onPaymentFailed({ resultCode: "Refused" })
    })

    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
    expect(createPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("remounts a fresh Drop-in once the session is replaced", async () => {
    // The error screen tears down the PCI secured-field iframes, so a new
    // Adyen Session is the only route back to a usable form.
    const { rerender } = renderAdyen()
    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(1)
    })

    const replaced = order({
      payment_sessions: [
        {
          ...ADYEN_SESSION,
          id: "session-adyen-2",
          response_data: { id: "CS-2", sessionData: "blob-2" },
        },
      ],
    })
    rerender(
      <Wrapper currentOrder={replaced}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingAdyenPayment containerClassName="dropin" />
        </PaymentSetting>
      </Wrapper>
    )

    await waitFor(() => {
      expect(adyen.dropinMount).toHaveBeenCalledTimes(2)
    })
    expect(adyen.dropinRemove).toHaveBeenCalled()
    expect(adyen.captured.options.session).toEqual({ id: "CS-2", sessionData: "blob-2" })
  })
})
