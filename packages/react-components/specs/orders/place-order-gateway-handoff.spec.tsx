import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PlaceOrderButtonPaymentSessions } from "#components/orders/PlaceOrderButtonPaymentSessions"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  type PaymentGatewaySubmitResult,
  registerPaymentGateway,
  resetPaymentGatewayStore,
  setPaymentGatewayResume,
} from "#utils/paymentGatewayStore"
import { resetTermsAcceptanceStore } from "#utils/termsAcceptanceStore"

const { authorizeGiftCardsMock, discardPaymentSessionMock, placeOrderMock, refundGiftCardsMock } =
  vi.hoisted(() => ({
    authorizeGiftCardsMock: vi.fn(),
    discardPaymentSessionMock: vi.fn(),
    placeOrderMock: vi.fn(),
    refundGiftCardsMock: vi.fn(),
  }))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    authorizeGiftCardSessions: authorizeGiftCardsMock,
    discardPaymentSession: discardPaymentSessionMock,
    placeOrderWithPaymentSessions: placeOrderMock,
    refundGiftCardSessions: refundGiftCardsMock,
  }
})

vi.mock("#utils/organization", () => ({ useOrganizationConfig: () => ({ urls: {} }) }))

const ADYEN = { id: "ps-adyen", type: "payment_setting_adyens" }
function orderWithCard(overrides: Partial<Order> = {}): Partial<Order> {
  return {
    id: "order-1",
    status: "pending",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [ADYEN],
    payment_sessions: [{ id: "session-adyen", status: "unpaid", payment_setting: ADYEN }],
    ...overrides,
  } as Partial<Order>
}

const setOrderErrors = vi.fn()
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
            setOrderErrors,
            getOrder,
          } as never
        }
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

/** Stands in for `<PaymentSettingAdyenPayment>`: registers, answers on demand. */
function useFakeGateway(result: PaymentGatewaySubmitResult) {
  const submit = vi.fn(async () => result)
  registerPaymentGateway("order-1", submit)
  return submit
}

async function clickPlace() {
  await act(async () => {
    fireEvent.click(screen.getByTestId("place"))
  })
}

function renderButton(currentOrder: Partial<Order> | null = orderWithCard()) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PlaceOrderButtonPaymentSessions data-testid="place" label="Place order" />
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetPaymentGatewayStore()
  resetTermsAcceptanceStore()
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  refundGiftCardsMock.mockResolvedValue({ refundedSessionIds: [], errors: [], timedOut: false })
  discardPaymentSessionMock.mockResolvedValue(true)
  placeOrderMock.mockResolvedValue({ placed: true, order: orderWithCard(), errors: [] })
  getOrder.mockResolvedValue(orderWithCard())
})

describe("the button as the pay button", () => {
  it("asks the gateway to collect before placing the order", async () => {
    const submit = useFakeGateway({ status: "completed" })
    renderButton()

    await clickPlace()

    expect(submit).toHaveBeenCalledTimes(1)
    expect(placeOrderMock).toHaveBeenCalledTimes(1)
    // Collect first, place second.
    expect(submit.mock.invocationCallOrder[0]).toBeLessThan(
      placeOrderMock.mock.invocationCallOrder[0] as number
    )
  })

  it("places without asking anyone when no gateway has registered", async () => {
    // A manual or gift-card-only order. The handoff is empty and the sequence
    // is exactly what it was before.
    renderButton()

    await clickPlace()

    expect(authorizeGiftCardsMock).not.toHaveBeenCalled()
    expect(placeOrderMock).toHaveBeenCalledTimes(1)
  })

  it("charges the gift cards before the card, and refetches in between", async () => {
    // The charge order the gift card ADR established. Refetching matters: the
    // place sequence skips already-authorized sessions by reading the order it
    // is handed, so a stale copy would take the money twice.
    const submit = useFakeGateway({ status: "completed" })
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    renderButton()

    await clickPlace()

    const authorizeCall = authorizeGiftCardsMock.mock.invocationCallOrder[0] as number
    const refetchCall = getOrder.mock.invocationCallOrder[0] as number
    const submitCall = submit.mock.invocationCallOrder[0] as number
    expect(authorizeCall).toBeLessThan(refetchCall)
    expect(refetchCall).toBeLessThan(submitCall)
  })

  it("stops before the card when a gift card is refused", async () => {
    const submit = useFakeGateway({ status: "completed" })
    authorizeGiftCardsMock.mockResolvedValue({
      authorizedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Gift card balance is insufficient." }],
    })
    renderButton()

    await clickPlace()

    expect(submit).not.toHaveBeenCalled()
    expect(placeOrderMock).not.toHaveBeenCalled()
    expect(setOrderErrors).toHaveBeenCalledWith([
      expect.objectContaining({ message: "Gift card balance is insufficient." }),
    ])
  })

  it("gives the gateway a longer placeability budget than a local job", async () => {
    // The wait is a webhook round trip through a third party, not a Sidekiq hop.
    useFakeGateway({ status: "completed" })
    renderButton()

    await clickPlace()

    const args = placeOrderMock.mock.calls[0]?.[0]
    expect(args.attempts).toBe(20)
    expect(args.intervalMs).toBe(1000)
  })

  it("honours an explicit budget over the gateway default", async () => {
    useFakeGateway({ status: "completed" })
    render(
      <Wrapper currentOrder={orderWithCard()}>
        <PlaceOrderButtonPaymentSessions
          data-testid="place"
          placeableAttempts={3}
          placeableIntervalMs={50}
        />
      </Wrapper>
    )

    await clickPlace()

    const args = placeOrderMock.mock.calls[0]?.[0]
    expect(args.attempts).toBe(3)
    expect(args.intervalMs).toBe(50)
  })
})

describe("when the gateway does not complete", () => {
  it("says nothing when the form is incomplete", async () => {
    // The gateway is showing its own validation. Reporting an error on top of
    // it would tell the shopper something failed when nothing was attempted.
    useFakeGateway({ status: "incomplete" })
    renderButton()

    await clickPlace()

    expect(placeOrderMock).not.toHaveBeenCalled()
    expect(setOrderErrors).toHaveBeenCalledWith([])
    expect(setOrderErrors).toHaveBeenCalledTimes(1)
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
  })

  it("refunds the gift cards it charged and burns the session on a refusal", async () => {
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    useFakeGateway({ status: "failed", code: "Refused" })
    renderButton()

    await clickPlace()

    expect(refundGiftCardsMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionIds: ["gc-1"] })
    )
    expect(discardPaymentSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "session-adyen" })
    )
    expect(placeOrderMock).not.toHaveBeenCalled()
    expect(setOrderErrors).toHaveBeenCalledWith([
      expect.objectContaining({ message: "Refused", meta: { error: "Refused" } }),
    ])
  })

  it("refunds only what this attempt charged", async () => {
    // A card charged by an earlier timed-out attempt is not ours to give back.
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
    useFakeGateway({ status: "failed", code: "Refused" })
    renderButton()

    await clickPlace()

    expect(refundGiftCardsMock).not.toHaveBeenCalled()
  })

  it("touches nothing when the outcome is unknown", async () => {
    // The payment may have gone through: refunding could take back money for a
    // card that did charge, and the session is what the webhook settles against.
    authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: ["gc-1"], errors: [] })
    useFakeGateway({ status: "unknown", code: "NETWORK_ERROR" })
    renderButton()

    await clickPlace()

    expect(refundGiftCardsMock).not.toHaveBeenCalled()
    expect(discardPaymentSessionMock).not.toHaveBeenCalled()
    expect(setOrderErrors).toHaveBeenCalledWith([
      expect.objectContaining({ meta: { error: "NETWORK_ERROR" } }),
    ])
  })
})

describe("returning from a 3DS redirect", () => {
  it("places the order without a click, and without asking for the terms again", async () => {
    // Acceptance did not survive the navigation, and the money is already
    // taken — asking again would leave anyone who declines with a paid,
    // unplaced order. Acceptance happened before the redirect, or the button
    // was never clickable.
    renderButton()
    expect(placeOrderMock).not.toHaveBeenCalled()

    await act(async () => {
      setPaymentGatewayResume("order-1", "resumed")
    })

    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledTimes(1)
    })
  })

  it("places once, however many times the phase is republished", async () => {
    renderButton()

    await act(async () => {
      setPaymentGatewayResume("order-1", "resumed")
    })
    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledTimes(1)
    })
    await act(async () => {
      setPaymentGatewayResume("order-1", "idle")
      setPaymentGatewayResume("order-1", "resumed")
    })

    expect(placeOrderMock).toHaveBeenCalledTimes(1)
  })

  it("reports a refused redirect and burns the session, but refunds nothing", async () => {
    // Which gift cards this attempt charged was lost with the page, so giving
    // them back could take money for a payment that is still settling.
    renderButton()

    await act(async () => {
      setPaymentGatewayResume("order-1", "failed", [
        { code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE", message: "Refused" },
      ])
    })

    await waitFor(() => {
      expect(discardPaymentSessionMock).toHaveBeenCalled()
    })
    expect(setOrderErrors).toHaveBeenCalledWith([expect.objectContaining({ message: "Refused" })])
    expect(refundGiftCardsMock).not.toHaveBeenCalled()
    expect(placeOrderMock).not.toHaveBeenCalled()
  })

  it("shows the button as busy while the redirect is being completed", async () => {
    renderButton()

    await act(async () => {
      setPaymentGatewayResume("order-1", "resuming")
    })

    expect((screen.getByTestId("place") as HTMLButtonElement).disabled).toBe(true)
  })
})
