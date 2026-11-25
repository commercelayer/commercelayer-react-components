import type { Order } from "@commercelayer/sdk"
import { render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import { useCheckoutComRedirectResume } from "#hooks/useCheckoutComRedirectResume"
import { getHandoffSnapshot, resetPaymentGatewayStore } from "#utils/paymentGatewayStore"

const record = vi.hoisted(() => vi.fn())
vi.mock("@commercelayer/core-components", async (original) => ({
  ...(await original<typeof import("@commercelayer/core-components")>()),
  recordCheckoutComPayment: record,
}))

const SETTING = { id: "ps-cko", type: "payment_setting_checkout_coms", public_key: "pk_sbox_ABC" }

/**
 * A payment id nobody else has used. The hook latches handled returns
 * process-wide on purpose, so a shared constant would have the first test
 * consume it for every test after it.
 */
let paymentCount = 0
function freshPaymentId(): string {
  paymentCount += 1
  return `pay_${paymentCount}`
}

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [SETTING],
    payment_sessions: [
      {
        id: "session-cko",
        status: "unpaid",
        created_at: "2026-11-25T10:00:00Z",
        payment_setting: SETTING,
        client_data: { success_url: "https://shop/s", failure_url: "https://shop/f" },
        response_data: { id: "ps_1", payment_session_secret: "pss" },
      },
    ],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()

function Harness({ currentOrder }: { currentOrder?: Partial<Order> | null }): ReactNode {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={{ ...defaultOrderContext, order: currentOrder ?? undefined, getOrder } as never}
      >
        <Resume />
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function Resume(): null {
  useCheckoutComRedirectResume()
  return null
}

/** Arrive as if Checkout.com had just sent the shopper back. */
function returnFromCheckoutCom(outcome: "success" | "failure", paymentId?: string): void {
  const query = new URLSearchParams({ paymentReturn: "true", checkout_com_return: outcome })
  if (paymentId != null) query.set("cko-payment-id", paymentId)
  window.history.replaceState({}, "", `/checkout/order-1?${query.toString()}`)
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  record.mockResolvedValue(undefined)
  getOrder.mockResolvedValue(order())
  window.history.replaceState({}, "", "/checkout/order-1")
})

describe("useCheckoutComRedirectResume", () => {
  it("does nothing on a plain visit", () => {
    render(<Harness currentOrder={order()} />)
    expect(record).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("records the payment and reports the collection done after a success", async () => {
    // The card component is gone after the redirect, so its
    // `onPaymentCompleted` never runs: the payment id from the URL is recorded
    // instead, and `<PlaceOrderButton>` takes the order the rest of the way.
    const paymentId = freshPaymentId()
    returnFromCheckoutCom("success", paymentId)
    render(<Harness currentOrder={order()} />)

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token",
        paymentSessionId: "session-cko",
        clientData: { success_url: "https://shop/s", failure_url: "https://shop/f" },
        paymentId,
      })
    )
    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("reports a failure without recording anything", async () => {
    // A declined payment written into the session would only produce a failed
    // authorization.
    returnFromCheckoutCom("failure", freshPaymentId())
    render(<Harness currentOrder={order()} />)

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("failed")
    })
    expect(getHandoffSnapshot("order-1").errors[0]).toMatchObject({
      resource: "orders",
      meta: { error: "declined" },
    })
    expect(record).not.toHaveBeenCalled()
  })

  it("reports a failure when the payment could not be recorded", async () => {
    record.mockRejectedValueOnce(new Error("network"))
    returnFromCheckoutCom("success", freshPaymentId())
    render(<Harness currentOrder={order()} />)

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("failed")
    })
    expect(getHandoffSnapshot("order-1").errors[0]).toMatchObject({
      meta: { error: "payment_not_recorded" },
    })
  })

  it("drops the return parameters and keeps the application's own", async () => {
    // A reload must not report a finished return a second time.
    returnFromCheckoutCom("success", freshPaymentId())
    render(<Harness currentOrder={order()} />)

    await waitFor(() => {
      expect(window.location.search).toBe("?paymentReturn=true")
    })
  })

  it("waits for the order's sessions before claiming the return", async () => {
    const paymentId = freshPaymentId()
    returnFromCheckoutCom("success", paymentId)
    const { rerender } = render(<Harness currentOrder={order({ payment_sessions: undefined })} />)

    expect(record).not.toHaveBeenCalled()
    expect(window.location.search).toContain("checkout_com_return")

    rerender(<Harness currentOrder={order()} />)
    await waitFor(() => {
      expect(record).toHaveBeenCalledWith(expect.objectContaining({ paymentId }))
    })
  })

  it("leaves a session that already carries a live authorization alone", async () => {
    // The payment was picked up already; reporting it again would start a
    // second place.
    returnFromCheckoutCom("success", freshPaymentId())
    const [session] = order().payment_sessions as unknown as Record<string, unknown>[]
    render(
      <Harness
        currentOrder={order({
          payment_sessions: [
            { ...session, payment_authorization: { id: "auth-1", status: "succeeded" } },
          ],
        })}
      />
    )

    await waitFor(() => {
      expect(window.location.search).toBe("?paymentReturn=true")
    })
    expect(record).not.toHaveBeenCalled()
    expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("no")
  })

  it("ignores a return whose session is not Checkout.com's", async () => {
    returnFromCheckoutCom("success", freshPaymentId())
    render(
      <Harness
        currentOrder={order({
          payment_sessions: [
            {
              id: "session-stripe",
              status: "unpaid",
              payment_setting: { id: "ps-stripe", type: "payment_setting_stripes" },
            },
          ],
        })}
      />
    )

    await waitFor(() => {
      expect(window.location.search).toBe("?paymentReturn=true")
    })
    expect(record).not.toHaveBeenCalled()
  })

  it("reports the same return once, however many times it renders", async () => {
    const paymentId = freshPaymentId()
    returnFromCheckoutCom("success", paymentId)
    render(
      <>
        <Harness currentOrder={order()} />
        <Harness currentOrder={order()} />
      </>
    )

    await waitFor(() => {
      expect(getHandoffSnapshot("order-1").collectedOutOfBand).toBe("done")
    })
    expect(record).toHaveBeenCalledTimes(1)
  })
})
