import type { Order } from "@commercelayer/sdk"
import { render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { useStripeRedirectResume } from "#hooks/useStripeRedirectResume"
import { getHandoffSnapshot, resetPaymentGatewayStore } from "#utils/paymentGatewayStore"

const stripe = vi.hoisted(() => ({
  retrievePaymentIntent: vi.fn(),
  loadStripe: vi.fn(),
}))

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: (key: string) => {
    stripe.loadStripe(key)
    return Promise.resolve({ retrievePaymentIntent: stripe.retrievePaymentIntent })
  },
}))

const SETTING = { id: "ps-stripe", type: "payment_setting_stripes", public_key: "pk_test_ABC" }

/**
 * A secret nobody else has used.
 *
 * The hook latches handled secrets process-wide on purpose — two trees on a
 * page must not both report one return — so a shared constant would have the
 * first test consume it for every test after it.
 */
let secretCount = 0
function freshSecret(): string {
  secretCount += 1
  return `pi_${secretCount}_secret_${secretCount}`
}

function order(secret: string, overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [SETTING],
    payment_sessions: [
      {
        id: "session-stripe",
        status: "unpaid",
        created_at: "2026-09-09T10:00:00Z",
        payment_setting: SETTING,
        response_data: { client_secret: secret },
      },
    ],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function Harness({ currentOrder }: { currentOrder?: Partial<Order> | null }): ReactNode {
  return (
    <OrderContext.Provider
      value={{ ...defaultOrderContext, order: currentOrder ?? undefined, getOrder } as never}
    >
      <Resume />
    </OrderContext.Provider>
  )
}

function Resume(): null {
  useStripeRedirectResume()
  return null
}

/** Arrive as if Stripe had just sent the shopper back. */
function returnFromStripe(secret: string): void {
  window.history.replaceState(
    {},
    "",
    `/checkout/order-1?payment_intent=pi_123&payment_intent_client_secret=${secret}&redirect_status=succeeded`
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  stripe.retrievePaymentIntent.mockResolvedValue({ paymentIntent: { status: "requires_capture" } })
  window.history.replaceState({}, "", "/checkout/order-1")
})

describe("useStripeRedirectResume", () => {
  it("does nothing on a plain visit", async () => {
    render(<Harness currentOrder={order(freshSecret())} />)
    expect(stripe.retrievePaymentIntent).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("reports the collection as done when the intent holds the money", async () => {
    // Nobody clicked anything: the shopper was on Stripe's page. This is the
    // same event a gateway's own button raises, so it is reported the same way
    // and `<PlaceOrderButton>` takes the order the rest of the way.
    const secret = freshSecret()
    returnFromStripe(secret)
    render(<Harness currentOrder={order(secret)} />)

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(stripe.loadStripe).toHaveBeenCalledWith("pk_test_ABC")
    expect(stripe.retrievePaymentIntent).toHaveBeenCalledWith(secret)
  })

  it("refetches the order, because it moved on while the shopper was away", async () => {
    const secret = freshSecret()
    returnFromStripe(secret)
    render(<Harness currentOrder={order(secret)} />)
    await waitFor(() => {
      expect(getOrder).toHaveBeenCalledWith("order-1")
    })
  })

  it("cleans Stripe's parameters out of the address bar", async () => {
    // A reload must not report a finished return a second time.
    const secret = freshSecret()
    returnFromStripe(secret)
    render(<Harness currentOrder={order(secret)} />)

    await waitFor(() => {
      expect(window.location.search).not.toContain("payment_intent_client_secret")
    })
    expect(window.location.search).not.toContain("redirect_status")
    expect(window.location.pathname).toBe("/checkout/order-1")
  })

  it("reports a refused intent as a failed collection", async () => {
    stripe.retrievePaymentIntent.mockResolvedValue({
      paymentIntent: { status: "requires_payment_method" },
    })
    const secret = freshSecret()
    returnFromStripe(secret)
    render(<Harness currentOrder={order(secret)} />)

    await waitFor(() => {
      const snapshot = getHandoffSnapshot("order-1")
      expect(snapshot.collectedOutOfBand).toBe("failed")
      expect(snapshot.errors[0]?.meta).toEqual({ error: "requires_payment_method" })
    })
  })

  it("ignores a secret that is not the session's", async () => {
    // The order is the source of truth. A secret from somewhere else — an old
    // tab, a copied URL — is not ours to act on.
    returnFromStripe("pi_999_secret_000")
    render(<Harness currentOrder={order(freshSecret())} />)

    expect(stripe.retrievePaymentIntent).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("leaves a session that already holds an authorization alone", async () => {
    // The payment has been picked up. Reporting the return again would start a
    // second place.
    const secret = freshSecret()
    returnFromStripe(secret)
    render(
      <Harness
        currentOrder={order(secret, {
          payment_sessions: [
            {
              id: "session-stripe",
              status: "authorized",
              created_at: "2026-09-09T10:00:00Z",
              payment_setting: SETTING,
              response_data: { client_secret: secret },
              payment_authorization: { status: "succeeded" },
            },
          ],
        })}
      />
    )

    expect(stripe.retrievePaymentIntent).not.toHaveBeenCalled()
  })

  it("reports one return once, however many trees are mounted", async () => {
    // The latch is process-wide for exactly this: two `<PaymentSetting>` trees
    // on a page, or a remount before the refetch lands, must not each report
    // the same return — the second would arrive after the place had started.
    const secret = freshSecret()
    returnFromStripe(secret)
    render(
      <>
        <Harness currentOrder={order(secret)} />
        <Harness currentOrder={order(secret)} />
      </>
    )

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(stripe.retrievePaymentIntent).toHaveBeenCalledTimes(1)
  })

  it("waits for the order rather than burning the parameter", async () => {
    // Arriving before the order has its sessions, the value has to survive for
    // a later render — it is the only record that a return happened.
    const secret = freshSecret()
    returnFromStripe(secret)
    const { rerender } = render(<Harness currentOrder={{ id: "order-1" } as Partial<Order>} />)
    expect(window.location.search).toContain("payment_intent_client_secret")

    rerender(<Harness currentOrder={order(secret)} />)
    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
  })
})
