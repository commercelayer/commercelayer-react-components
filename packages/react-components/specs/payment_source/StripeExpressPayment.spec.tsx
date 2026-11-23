// The Payment Request handlers were registered in the render body and never removed, so every
// re-render stacked another set, each closing over the order of its own render: one wallet
// payment then placed the order and confirmed the intent once per stacked handler (#952).
import { act, render, waitFor } from "@testing-library/react"
import { StripeExpressPayment } from "#components/payment_source/StripeExpressPayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import { setExpressPlaceOrder } from "#utils/expressPaymentHelper"

type Handler = (ev: unknown) => unknown
const handlers = new Map<string, Handler[]>()
const fakePaymentRequest = {
  canMakePayment: vi.fn(async () => ({ applePay: true })),
  on: vi.fn((type: string, handler: Handler) => {
    handlers.set(type, [...(handlers.get(type) ?? []), handler])
  }),
  off: vi.fn((type: string, handler: Handler) => {
    handlers.set(
      type,
      (handlers.get(type) ?? []).filter((h) => h !== handler)
    )
  }),
}
const fakeStripe = {
  paymentRequest: vi.fn(() => fakePaymentRequest),
  confirmCardPayment: vi.fn(async () => ({ paymentIntent: { status: "succeeded" } })),
}

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => fakeStripe,
  PaymentRequestButtonElement: () => <div data-testid="prb" />,
}))
vi.mock("#utils/expressPaymentHelper", () => ({
  getAvailableExpressPayments: () => [{ payment_source_type: "stripe_payments" }],
  getExpressShippingMethods: vi.fn(),
  setExpressFakeAddress: vi.fn(async () => ({})),
  setExpressShippingMethod: vi.fn(async () => ({})),
  setExpressPlaceOrder: vi.fn(async () => ({ id: "order" })),
  expressRedirectUrl: vi.fn(async () => {}),
}))

beforeEach(() => {
  handlers.clear()
  vi.clearAllMocks()
})

function tree(orderId: string) {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as any}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          // biome-ignore lint/suspicious/noExplicitAny: test cast
          order: { id: orderId, total_amount_with_taxes_cents: 100 } as any,
        }}
      >
        <PaymentMethodContext.Provider
          value={{
            ...defaultPaymentMethodContext,
            // biome-ignore lint/suspicious/noExplicitAny: test cast
            paymentMethods: [{}] as any,
            // biome-ignore lint/suspicious/noExplicitAny: test cast
            paymentSource: { id: "ps-1" } as any,
          }}
        >
          <StripeExpressPayment clientSecret="pi_secret" />
        </PaymentMethodContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("StripeExpressPayment", () => {
  it("keeps one set of handlers across re-renders and places the latest order once", async () => {
    const { rerender, unmount, findByTestId } = render(tree("order-1"))
    await findByTestId("prb")
    rerender(tree("order-2"))
    rerender(tree("order-3"))

    for (const type of ["shippingaddresschange", "shippingoptionchange", "paymentmethod"]) {
      expect(handlers.get(type)).toHaveLength(1)
    }

    const complete = vi.fn()
    await act(async () => {
      await handlers.get("paymentmethod")?.[0]?.({
        paymentMethod: { id: "pm_1" },
        complete,
      })
    })
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
    expect(fakeStripe.confirmCardPayment).toHaveBeenCalledTimes(1)
    // the payment-source update and the place, both on the current order
    expect(vi.mocked(setExpressPlaceOrder).mock.calls.map(([p]) => p.orderId)).toEqual([
      "order-3",
      "order-3",
    ])

    unmount()
    for (const type of ["shippingaddresschange", "shippingoptionchange", "paymentmethod"]) {
      expect(handlers.get(type)).toHaveLength(0)
    }
  })

  it("completes the wallet sheet once when the intent requires action", async () => {
    fakeStripe.confirmCardPayment
      .mockResolvedValueOnce({ paymentIntent: { status: "requires_action" } })
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      .mockResolvedValueOnce({} as any)
    const { findByTestId } = render(tree("order-1"))
    await findByTestId("prb")

    const complete = vi.fn()
    await act(async () => {
      await handlers.get("paymentmethod")?.at(-1)?.({ paymentMethod: { id: "pm_1" }, complete })
    })
    expect(setExpressPlaceOrder).toHaveBeenCalledTimes(2)
    expect(complete).toHaveBeenCalledTimes(1)
    expect(complete).toHaveBeenCalledWith("success")
  })
})
