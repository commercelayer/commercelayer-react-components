import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PlaceOrderButton } from "#components/orders/PlaceOrderButton"
import { PlaceOrderButtonPaymentSessions } from "#components/orders/PlaceOrderButtonPaymentSessions"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const { placeOrderMock } = vi.hoisted(() => ({ placeOrderMock: vi.fn() }))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return { ...actual, placeOrderWithPaymentSessions: placeOrderMock }
})

// The older branch drags in gateway SDKs and organization config; this suite is
// about routing and the new branch, so keep it out of the way.
vi.mock("#components/orders/PlaceOrderButtonPaymentSource", () => ({
  PlaceOrderButtonPaymentSource: () => <button type="button">payment_source branch</button>,
}))
vi.mock("#utils/organization", () => ({ useOrganizationConfig: () => ({ urls: {} }) }))

const MANUAL = { id: "ps-manual", type: "payment_setting_manuals" }

function orderOnSessions(overrides: Partial<Order> = {}): Partial<Order> {
  return {
    id: "order-1",
    status: "pending",
    available_payment_settings: [MANUAL],
    payment_sessions: [{ id: "session-1", status: "unpaid", payment_setting: MANUAL }],
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

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  placeOrderMock.mockResolvedValue({ placed: true, order: { status: "placed" }, errors: [] })
})

describe("PlaceOrderButton routing", () => {
  it("renders the payment_source branch for an order on that model", () => {
    render(
      <Wrapper
        currentOrder={{ id: "order-1", available_payment_methods: [{ id: "pm-1" }] } as never}
      >
        <PlaceOrderButton />
      </Wrapper>
    )
    expect(screen.getByRole("button").textContent).toBe("payment_source branch")
  })

  it("renders the payment_sessions branch for an order on that model", () => {
    render(
      <Wrapper currentOrder={orderOnSessions()}>
        <PlaceOrderButton label="Pay now" />
      </Wrapper>
    )
    expect(screen.getByRole("button").textContent).toBe("Pay now")
  })

  // Neither branch may run before the model is known: mounting the older one
  // would start redirect effects reading a payment source this order has not
  // got, and rendering nothing would make the button appear late — a visible
  // change for applications that only ever mounted <PlaceOrderButton>.
  it("renders an inert button while the model is undetermined", () => {
    render(
      <Wrapper currentOrder={null}>
        <PlaceOrderButton label="Pay now" />
      </Wrapper>
    )
    const button = screen.getByRole("button") as HTMLButtonElement
    expect(button.textContent).toBe("Pay now")
    expect(button.disabled).toBe(true)
  })

  it("does not place anything while the model is undetermined", async () => {
    render(
      <Wrapper currentOrder={null}>
        <PlaceOrderButton />
      </Wrapper>
    )
    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })
    expect(placeOrderMock).not.toHaveBeenCalled()
  })
})

describe("PlaceOrderButtonPaymentSessions", () => {
  function renderButton(currentOrder: Partial<Order> | null = orderOnSessions(), props = {}) {
    return render(
      <Wrapper currentOrder={currentOrder}>
        <PlaceOrderButtonPaymentSessions {...props} />
      </Wrapper>
    )
  }

  // Placeability cannot be read before clicking: `order.placeable` is never
  // served on a GET, and it stays false while the asynchronous authorization
  // is still in flight. Disabling on it would block the button exactly when
  // payment is under way.
  it("stays enabled without waiting for placeability", () => {
    renderButton()
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false)
  })

  it("places the order with the current session", async () => {
    const onClick = vi.fn()
    renderButton(orderOnSessions(), { onClick })

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "order-1",
          paymentSession: expect.objectContaining({ id: "session-1" }),
        })
      )
    })
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ placed: true }))
  })

  it("surfaces placeability reasons as one error each", async () => {
    placeOrderMock.mockResolvedValue({
      placed: false,
      timedOut: true,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: "Payment does not cover the order.",
          field: "payment_action",
        },
        {
          code: "VALIDATION_ERROR",
          message: "Billing address is missing.",
          field: "billing_address",
        },
      ],
    })
    const onClick = vi.fn()
    renderButton(orderOnSessions(), { onClick })

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    await waitFor(() => {
      expect(setOrderErrors).toHaveBeenCalled()
    })
    const errors = setOrderErrors.mock.calls.at(-1)?.[0]
    expect(errors).toHaveLength(2)
    expect(errors[0]).toMatchObject({ field: "payment_action", resource: "orders" })
    expect(errors[1]).toMatchObject({ field: "billing_address" })
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ placed: false }))
    // The order moved on without us, so stale amounts must not stay on screen.
    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("reports a thrown error without claiming the order was placed", async () => {
    placeOrderMock.mockRejectedValue(new Error("Unauthorized"))
    const onClick = vi.fn()
    renderButton(orderOnSessions(), { onClick })

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({
          placed: false,
          errors: [expect.objectContaining({ message: "Unauthorized" })],
        })
      )
    })
  })

  describe("privacy and terms", () => {
    // A legal requirement of the checkout, not a property of the payment model,
    // so it gates this branch exactly as it gates the older one.
    it("blocks the button when both URLs are configured and the box is unchecked", () => {
      renderButton(
        orderOnSessions({
          privacy_url: "https://example.com/privacy",
          terms_url: "https://example.com/terms",
        } as never)
      )
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)
    })

    it("allows the button once the box is checked", () => {
      localStorage.setItem("privacy-terms", "true")
      renderButton(
        orderOnSessions({
          privacy_url: "https://example.com/privacy",
          terms_url: "https://example.com/terms",
        } as never)
      )
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false)
    })

    it("does not gate an order with no privacy and terms URLs", () => {
      renderButton()
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false)
    })
  })
})

// The checkbox lives outside the button and talks to it through a DOM event.
// In container mode it used to notify only PlaceOrderContext, which the newer
// branch does not use — leaving the button disabled forever.
describe("privacy checkbox reaches the payment_sessions button", () => {
  it("enables the button when the recheck event fires", async () => {
    render(
      <Wrapper
        currentOrder={orderOnSessions({
          privacy_url: "https://example.com/privacy",
          terms_url: "https://example.com/terms",
        } as never)}
      >
        <PlaceOrderButtonPaymentSessions />
      </Wrapper>
    )
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)

    await act(async () => {
      localStorage.setItem("privacy-terms", "true")
      window.dispatchEvent(new CustomEvent("cl:placeorder:recheck"))
    })

    await waitFor(() => {
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false)
    })
  })
})
