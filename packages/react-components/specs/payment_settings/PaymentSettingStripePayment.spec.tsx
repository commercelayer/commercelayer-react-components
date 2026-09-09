import type {
  Order,
  PaymentSession,
  PaymentSetting as PaymentSettingResource,
} from "@commercelayer/sdk"
import { act, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingRadioButton } from "#components/payment_settings/PaymentSettingRadioButton"
import { PaymentSettingStripePayment } from "#components/payment_settings/PaymentSettingStripePayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { getHandoffSnapshot, resetPaymentGatewayStore } from "#utils/paymentGatewayStore"

/**
 * A fake Stripe SDK, deliberately shallow.
 *
 * `Elements` renders its children rather than talking to Stripe, and the two
 * hooks hand back the same objects the tests then assert on — so what is under
 * test is our mapping from Stripe's outcomes to the handoff's four, which is
 * the only part of this component that carries a decision.
 */
const stripe = vi.hoisted(() => ({
  loadStripe: vi.fn(),
  submit: vi.fn(),
  confirmPayment: vi.fn(),
  // The `onChange` handler the Payment Element was given, so a test can report
  // the form complete without a real Element.
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  captured: { onChange: null as any, options: null as any, elementsOptions: null as any },
}))

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: (key: string) => {
    stripe.loadStripe(key)
    return Promise.resolve({})
  },
}))

vi.mock("@stripe/react-stripe-js", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  Elements: ({ children, options }: any) => {
    stripe.captured.elementsOptions = options
    return children
  },
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  PaymentElement: ({ options, onChange }: any) => {
    stripe.captured.options = options
    stripe.captured.onChange = onChange
    return <div data-testid="payment-element" />
  },
  useStripe: () => ({ confirmPayment: stripe.confirmPayment }),
  useElements: () => ({ submit: stripe.submit }),
}))

const STRIPE_SETTING = {
  id: "ps-stripe",
  type: "payment_setting_stripes",
  name: "Stripe",
  public_key: "pk_test_ABC",
} as unknown as PaymentSettingResource

const STRIPE_SESSION = {
  id: "session-stripe",
  type: "payment_sessions",
  status: "unpaid",
  amount_cents: 7100,
  payment_setting: { id: "ps-stripe", type: "payment_setting_stripes" },
  response_data: { client_secret: "pi_123_secret_456" },
} as unknown as PaymentSession

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [STRIPE_SETTING],
    payment_sessions: [STRIPE_SESSION],
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

function renderStripe(currentOrder: Partial<Order> | null = order(), returnUrl?: string) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting returnUrl={returnUrl}>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingStripePayment containerClassName="stripe" />
      </PaymentSetting>
    </Wrapper>
  )
}

/** The host collection this component is expected to have registered. */
function hostSubmit() {
  const { collection } = getHandoffSnapshot("order-1")
  if (collection?.by !== "host") {
    throw new Error(`expected a host collection, got ${JSON.stringify(collection)}`)
  }
  return collection.submit
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  stripe.captured.onChange = null
  stripe.captured.options = null
  stripe.captured.elementsOptions = null
  stripe.submit.mockResolvedValue({})
  stripe.confirmPayment.mockResolvedValue({ paymentIntent: { status: "requires_capture" } })
  getOrder.mockResolvedValue(order())
})

describe("<PaymentSettingStripePayment> mounting", () => {
  it("builds Elements from the PaymentIntent secret on the session", async () => {
    renderStripe()

    await waitFor(() => {
      expect(screen.getByTestId("payment-element")).toBeTruthy()
    })
    expect(stripe.captured.elementsOptions).toEqual({ clientSecret: "pi_123_secret_456" })
    expect(stripe.loadStripe).toHaveBeenCalledWith("pk_test_ABC")
  })

  it("renders nothing for a setting that is not Stripe's", () => {
    const { container } = renderStripe(
      order({
        available_payment_settings: [
          { id: "ps-manual", type: "payment_setting_manuals", name: "Wire" },
        ],
        payment_sessions: [],
      })
    )
    expect(container.querySelector(".stripe")).toBeNull()
  })

  it("shows no form until a session exists to confirm", async () => {
    // Selecting is what creates the PaymentIntent, so before that there is no
    // secret and an Elements group would have nothing to be built from.
    renderStripe(order({ payment_sessions: [] }))
    expect(screen.queryByTestId("payment-element")).toBeNull()
  })

  it("survives a refetch that arrives without the client secret", async () => {
    // `response_data` is not in every consumer's `fields` allowlist, so a
    // checkout that refetches for its own reasons can hand back the same
    // session with the secret missing. Read literally that unmounts the
    // Elements group and loses whatever the shopper had typed — which is
    // exactly what happened: an end-to-end run came back with one digit of a
    // card number in the field.
    const { rerender } = render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingStripePayment containerClassName="stripe" />
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(screen.getByTestId("payment-element")).toBeTruthy()
    })

    const withoutSecret = {
      ...(STRIPE_SESSION as unknown as Record<string, unknown>),
      response_data: {},
    }
    rerender(
      <Wrapper currentOrder={order({ payment_sessions: [withoutSecret] })}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingStripePayment containerClassName="stripe" />
        </PaymentSetting>
      </Wrapper>
    )

    expect(screen.queryByTestId("payment-element")).not.toBeNull()
  })

  it("drops a remembered secret once the session itself changes", async () => {
    // A replaced session — after a refusal, or a gift card resizing the
    // remainder — makes the old secret point at a payment that is no longer the
    // selection, so keeping it would confirm the wrong intent.
    const { rerender } = render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingStripePayment containerClassName="stripe" />
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(screen.getByTestId("payment-element")).toBeTruthy()
    })

    const replaced = {
      ...(STRIPE_SESSION as unknown as Record<string, unknown>),
      id: "session-stripe-2",
      response_data: {},
    }
    rerender(
      <Wrapper currentOrder={order({ payment_sessions: [replaced] })}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingStripePayment containerClassName="stripe" />
        </PaymentSetting>
      </Wrapper>
    )

    expect(screen.queryByTestId("payment-element")).toBeNull()
  })

  it("defaults the Element to the tabs layout, and lets it be overridden", async () => {
    renderStripe()
    await waitFor(() => {
      expect(stripe.captured.options).not.toBeNull()
    })
    expect(stripe.captured.options).toEqual({ layout: "tabs" })

    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingStripePayment options={{ layout: "accordion" }} />
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(stripe.captured.options).toEqual({ layout: "accordion" })
    })
  })
})

describe("<PaymentSettingStripePayment> as the pay button's collection", () => {
  it("registers a host collection, because the Element is inert until confirmed", async () => {
    renderStripe()
    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collection?.by).toBe("host")
    })
  })

  it("reports readiness from the Element, never from our own guess", async () => {
    renderStripe()
    await waitFor(() => {
      expect(stripe.captured.onChange).not.toBeNull()
    })

    await act(async () => {
      stripe.captured.onChange({ complete: true })
    })
    const { collection } = getHandoffSnapshot("order-1")
    expect(collection?.by === "host" && collection.isReady).toBe(true)
  })

  it("confirms with the return URL the application gave", async () => {
    renderStripe(order(), "https://shop.example/checkout/o-1?paymentReturn=true")
    await waitFor(() => {
      expect(stripe.captured.onChange).not.toBeNull()
    })

    await act(async () => {
      await hostSubmit()()
    })

    expect(stripe.confirmPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        redirect: "if_required",
        confirmParams: { return_url: "https://shop.example/checkout/o-1?paymentReturn=true" },
      })
    )
  })
})

/**
 * The mapping this component exists for: Stripe's outcomes onto the handoff's
 * four. What separates them is not severity but **whether a rollback is safe** —
 * a verdict means no money moved, an unknown outcome means it might have.
 */
describe("<PaymentSettingStripePayment> reading Stripe's outcome", () => {
  async function submitOnce() {
    renderStripe()
    await waitFor(() => {
      expect(stripe.captured.onChange).not.toBeNull()
    })
    let result: unknown
    await act(async () => {
      result = await hostSubmit()()
    })
    return result
  }

  it.each(["succeeded", "requires_capture", "processing"])(
    "treats a %s intent as money taken",
    async (status) => {
      // `requires_capture` matters most: the intent is created with
      // `capture_method: manual`, so a successful authorization stops there and
      // never reaches `succeeded` until something captures it.
      stripe.confirmPayment.mockResolvedValue({ paymentIntent: { status } })
      expect(await submitOnce()).toEqual({ status: "completed" })
    }
  )

  it.each(["requires_payment_method", "canceled"])(
    "treats a %s intent as a refusal, which may be rolled back",
    async (status) => {
      stripe.confirmPayment.mockResolvedValue({ paymentIntent: { status } })
      expect(await submitOnce()).toEqual({ status: "failed", code: status })
    }
  )

  it("treats a card error as a refusal, carrying Stripe's own code", async () => {
    stripe.confirmPayment.mockResolvedValue({
      error: { type: "card_error", code: "card_declined", message: "Your card was declined." },
    })
    expect(await submitOnce()).toEqual({ status: "failed", code: "card_declined" })
  })

  it("prefers the decline code, which says why rather than what", async () => {
    stripe.confirmPayment.mockResolvedValue({
      error: { type: "card_error", decline_code: "insufficient_funds", message: "Declined." },
    })
    expect(await submitOnce()).toEqual({ status: "failed", code: "insufficient_funds" })
  })

  it.each(["api_error", "api_connection_error", "authentication_error"])(
    "treats a %s as unknown, so nothing is given back",
    async (type) => {
      // The confirmation may well have reached Stripe. Refunding gift cards
      // here could take money for a payment that in fact succeeded.
      stripe.confirmPayment.mockResolvedValue({ error: { type, code: type } })
      expect(await submitOnce()).toEqual({ status: "unknown", code: type })
    }
  )

  it("treats a validation error as a stop, with nothing to report", async () => {
    // Stripe has already shown it inside the Element, so there is no failure
    // for the application to render — the shopper simply has not finished.
    stripe.confirmPayment.mockResolvedValue({
      error: { type: "validation_error", code: "incomplete_number" },
    })
    expect(await submitOnce()).toEqual({ status: "incomplete" })
  })

  it("stops before confirming when the Element refuses to submit", async () => {
    stripe.submit.mockResolvedValue({ error: { type: "validation_error" } })
    expect(await submitOnce()).toEqual({ status: "incomplete" })
    expect(stripe.confirmPayment).not.toHaveBeenCalled()
  })

  it("treats a lingering requires_action as unknown", async () => {
    // With `redirect: "if_required"` Stripe completes the action itself, so
    // reaching here means it neither completed nor redirected — and what
    // happened is genuinely not known.
    stripe.confirmPayment.mockResolvedValue({ paymentIntent: { status: "requires_action" } })
    expect(await submitOnce()).toEqual({ status: "unknown", code: "requires_action" })
  })

  it("reports a refusal on the order, where <Errors> can see it", async () => {
    // `<Errors>` matches on `resource`, and the place-order button writes what
    // the handoff gives it into the order's error state. Tagged anything else,
    // a refusal vanishes from the only outlet consumers mount.
    let reported: { resource?: string; meta?: unknown }[] = []
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSetting>
          <PaymentSettingRadioButton data-testid="radio" />
          <PaymentSettingStripePayment>
            {({ errors, lastErrorCode }) => {
              reported = errors
              return <span data-testid="code">{lastErrorCode}</span>
            }}
          </PaymentSettingStripePayment>
        </PaymentSetting>
      </Wrapper>
    )
    await waitFor(() => {
      expect(stripe.captured.onChange).not.toBeNull()
    })
    stripe.confirmPayment.mockResolvedValue({
      error: { type: "card_error", code: "card_declined", message: "Your card was declined." },
    })

    await act(async () => {
      await hostSubmit()()
    })

    expect(reported[0]?.resource).toBe("orders")
    expect(reported[0]?.meta).toEqual({ error: "card_declined" })
    expect(screen.getByTestId("code").textContent).toBe("card_declined")
  })
})
