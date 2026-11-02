// A new payment source means a new checkout.com payment session, and the Flow built for the
// old one has to go. It used to stay mounted next to the new one: the shopper's card went
// into whichever came first, and its token and 3DS landed on a payment source the order no
// longer pointed at, so the shopper came back from 3DS to the payment step instead of the
// thank-you page.
import { act, render } from "@testing-library/react"
import { CheckoutComPayment } from "#components/payment_source/CheckoutComPayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"

vi.mock("#utils/hooks/useExternalScript", () => ({ default: () => true }))
vi.mock("#utils/jwt", () => ({ jwt: () => ({ test: true }) }))
vi.mock("#hooks/usePlaceOrderStateContext", () => ({
  usePlaceOrderStateContext: () => ({ placeOrderContext: { setPlaceOrderStatus: vi.fn() } }),
}))

interface FakeFlow {
  session: string
  mount: ReturnType<typeof vi.fn>
  unmount: ReturnType<typeof vi.fn>
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  options: any
}

let flows: FakeFlow[] = []
/** When set, `CheckoutWebComponents` waits for the test to release each load. */
let releases: Array<() => void> | null = null
const setPaymentRef = vi.fn()
const setPaymentSource = vi.fn()

beforeEach(() => {
  flows = []
  releases = null
  vi.clearAllMocks()
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  ;(window as any).CheckoutWebComponents = vi.fn(async (options: any) => {
    if (releases != null) {
      const queue = releases
      await new Promise<void>((resolve) => queue.push(resolve))
    }
    return {
      create: () => {
        const flow: FakeFlow = {
          session: options.paymentSession,
          mount: vi.fn(),
          unmount: vi.fn(),
          options,
        }
        flows.push(flow)
        return flow
      },
    }
  })
})

function paymentSource(id: string) {
  return { id, type: "checkout_com_payments", public_key: "pk", payment_session: `session-${id}` }
}

function tree(sourceId: string | null) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token", endpoint: "" }}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          order: {
            id: "order-1",
            payment_source: sourceId ? paymentSource(sourceId) : null,
            // biome-ignore lint/suspicious/noExplicitAny: test cast
          } as any,
        }}
      >
        <PaymentMethodContext.Provider
          // biome-ignore lint/suspicious/noExplicitAny: test cast
          value={{ ...defaultPaymentMethodContext, setPaymentRef, setPaymentSource } as any}
        >
          <CheckoutComPayment publicKey="pk" show />
        </PaymentMethodContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

const validCard = { isValid: () => true, type: "card" }

describe("CheckoutComPayment", () => {
  it("mounts one Flow for the order's payment source", async () => {
    await act(async () => {
      render(tree("ps-1"))
    })

    expect(flows).toHaveLength(1)
    expect(flows[0]?.session).toBe("session-ps-1")
    expect(flows[0]?.mount).toHaveBeenCalledTimes(1)
  })

  it("unmounts the previous Flow when the payment source changes", async () => {
    const { rerender } = render(tree("ps-1"))
    await act(async () => {})

    await act(async () => {
      rerender(tree("ps-2"))
    })

    expect(flows.map(({ session }) => session)).toEqual(["session-ps-1", "session-ps-2"])
    expect(flows[0]?.unmount).toHaveBeenCalledTimes(1)
    expect(flows[1]?.mount).toHaveBeenCalledTimes(1)
    expect(flows[1]?.unmount).not.toHaveBeenCalled()
  })

  it("does not mount a Flow whose payment source was replaced while it loaded", async () => {
    releases = []
    const { rerender } = render(tree("ps-1"))
    await act(async () => {})
    await act(async () => {
      rerender(tree("ps-2"))
    })

    // The newer load lands first, then the stale one.
    await act(async () => {
      releases?.[1]?.()
    })
    await act(async () => {
      releases?.[0]?.()
    })

    const mounted = flows.filter(({ mount }) => mount.mock.calls.length > 0)
    expect(mounted.map(({ session }) => session)).toEqual(["session-ps-2"])
  })

  it("ignores changes from a Flow that has been replaced", async () => {
    const { rerender } = render(tree("ps-1"))
    await act(async () => {})
    await act(async () => {
      rerender(tree("ps-2"))
    })
    setPaymentRef.mockClear()

    act(() => {
      flows[0]?.options.onChange(validCard)
    })
    expect(setPaymentRef).not.toHaveBeenCalled()

    act(() => {
      flows[1]?.options.onChange(validCard)
    })
    expect(setPaymentRef).toHaveBeenCalledTimes(1)
  })

  it("detaches the submit handler a replaced Flow had installed", async () => {
    // Kills: guarding only the replaced Flow's later `onChange` calls. The shopper
    // typed a valid card into the first Flow before the payment source was
    // replaced, so its submit handler, bound to the old source, is already on the
    // form, and submitting would tokenize and authorize against that source.
    const { container, rerender } = render(tree("ps-1"))
    await act(async () => {})
    const tokenize = vi.fn(async () => ({ data: { token: "tok_1" } }))
    act(() => {
      flows[0]?.options.onChange({ ...validCard, tokenize })
    })
    const form = container.querySelector("form") as HTMLFormElement
    const staleSubmit = form.onsubmit
    expect(staleSubmit).toBeTypeOf("function")

    await act(async () => {
      rerender(tree("ps-2"))
    })

    expect(form.onsubmit).toBeNull()
    // Even a handler that someone still holds must not reach the old source.
    await act(async () => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      await (staleSubmit as any)?.call(form, new Event("submit"))
    })
    expect(tokenize).not.toHaveBeenCalled()
    expect(setPaymentSource).not.toHaveBeenCalled()
  })

  it("updates the payment source the current Flow belongs to", async () => {
    const { rerender } = render(tree("ps-1"))
    await act(async () => {})
    await act(async () => {
      rerender(tree("ps-2"))
    })

    await act(async () => {
      await flows[1]?.options.onPaymentCompleted(validCard, {
        status: "Approved",
        id: "pay_1",
        type: "card",
      })
    })

    expect(setPaymentSource).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSourceId: "ps-2" })
    )
  })

  it("unmounts the Flow when the component unmounts", async () => {
    const { unmount } = render(tree("ps-1"))
    await act(async () => {})

    unmount()

    expect(flows[0]?.unmount).toHaveBeenCalledTimes(1)
  })
})
