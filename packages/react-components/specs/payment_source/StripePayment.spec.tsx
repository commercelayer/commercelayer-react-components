// A new Stripe payment source carries a new payment intent, and so a new client secret.
// Stripe's <Elements> reads `options.clientSecret` once, when it mounts, and ignores every
// later value ("Unsupported prop change: options.clientSecret is not a mutable property").
// When <PaymentGateway> recreated the source — a cart change leaves it `mismatched_amounts` —
// the form stayed bound to the old intent, and the pay button confirmed that one, for the
// old amount. The authorization then failed with AMOUNTS_MISMATCH after the shopper had paid.
import { act, render, waitFor } from "@testing-library/react"
import { StripePayment } from "#components/payment_source/StripePayment"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"

interface FakeElements {
  clientSecret: string
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  getElement: ReturnType<typeof vi.fn>
}

let groups: FakeElements[] = []
const confirmPayment = vi.fn(async () => ({}))

const fakeStripe = {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  elements: vi.fn((options: any) => {
    const group: FakeElements = {
      clientSecret: options.clientSecret,
      create: vi.fn(() => ({
        mount: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        update: vi.fn(),
        __elements: group,
      })),
      update: vi.fn(),
      getElement: vi.fn(),
    }
    groups.push(group)
    return group
  }),
  createToken: vi.fn(),
  createPaymentMethod: vi.fn(),
  confirmCardPayment: vi.fn(),
  confirmPayment,
  _registerWrapper: vi.fn(),
  registerAppInfo: vi.fn(),
}

vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(async () => fakeStripe) }))
vi.mock("#hooks/useCommerceLayer", () => ({ default: () => ({ sdkClient: () => ({}) }) }))
vi.mock("#hooks/usePlaceOrderStateContext", () => ({
  usePlaceOrderStateContext: () => ({ placeOrderContext: { setPlaceOrderStatus: vi.fn() } }),
}))

const setPaymentRef = vi.fn()

beforeEach(() => {
  groups = []
  vi.clearAllMocks()
})

function tree(clientSecret: string) {
  return (
    <OrderContext.Provider
      value={{
        ...defaultOrderContext,
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        order: { id: "order-1", customer_email: "shopper@example.com" } as any,
      }}
    >
      <PaymentMethodContext.Provider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        value={{ ...defaultPaymentMethodContext, setPaymentRef } as any}
      >
        <StripePayment publishableKey="pk_test" clientSecret={clientSecret} show />
      </PaymentMethodContext.Provider>
    </OrderContext.Provider>
  )
}

/** The form the place-order button submits, as <StripePaymentForm> last registered it. */
function registeredForm(): HTMLFormElement & { onsubmit: () => Promise<boolean> } {
  const registrations = setPaymentRef.mock.calls
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    .map(([arg]: any[]) => arg?.ref?.current)
    .filter((form) => form != null)
  return registrations.at(-1)
}

describe("StripePayment", () => {
  it("rebuilds the Elements group when the client secret changes", async () => {
    const { rerender } = render(tree("pi_old_secret_a"))
    await waitFor(() => expect(groups.map((g) => g.clientSecret)).toEqual(["pi_old_secret_a"]))

    rerender(tree("pi_new_secret_b"))

    await waitFor(() =>
      expect(groups.map((g) => g.clientSecret)).toEqual(["pi_old_secret_a", "pi_new_secret_b"])
    )
  })

  it("confirms the payment intent of the current client secret", async () => {
    const { rerender } = render(tree("pi_old_secret_a"))
    await waitFor(() => expect(registeredForm()).toBeDefined())

    rerender(tree("pi_new_secret_b"))
    await act(async () => {})

    await act(async () => {
      await registeredForm().onsubmit()
    })

    expect(confirmPayment).toHaveBeenCalledTimes(1)
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const [{ elements }] = confirmPayment.mock.calls[0] as any[]
    expect(elements.clientSecret).toBe("pi_new_secret_b")
  })

  it("keeps the same Elements group while the client secret does not change", async () => {
    const { rerender } = render(tree("pi_old_secret_a"))
    await waitFor(() => expect(groups).toHaveLength(1))

    rerender(tree("pi_old_secret_a"))
    await act(async () => {})

    expect(groups).toHaveLength(1)
  })
})
