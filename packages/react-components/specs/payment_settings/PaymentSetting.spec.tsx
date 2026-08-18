import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethod } from "#components/payment_methods/PaymentMethod"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingManualPayment } from "#components/payment_settings/PaymentSettingManualPayment"
import { PaymentSettingName } from "#components/payment_settings/PaymentSettingName"
import { PaymentSettingRadioButton } from "#components/payment_settings/PaymentSettingRadioButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const { createPaymentSessionMock } = vi.hoisted(() => ({ createPaymentSessionMock: vi.fn() }))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return { ...actual, createPaymentSession: createPaymentSessionMock }
})

const MANUAL = { id: "ps-manual", type: "payment_setting_manuals", name: "Bank transfer" }
const STRIPE = { id: "ps-stripe", type: "payment_setting_stripes", name: "Stripe" }

function order(overrides: Partial<Order> = {}): Partial<Order> {
  return {
    id: "order-1",
    available_payment_settings: [MANUAL],
    payment_sessions: [],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()
const addResourceToInclude = vi.fn()

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
            addResourceToInclude,
            getOrder,
          } as never
        }
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderSettings(currentOrder?: Partial<Order> | null) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSetting>
        <PaymentSettingRadioButton data-testid="radio" />
        <PaymentSettingName data-testid="name" />
        <PaymentSettingManualPayment instructions={<span data-testid="instructions">IBAN</span>} />
      </PaymentSetting>
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  createPaymentSessionMock.mockResolvedValue({ id: "session-new" })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("PaymentSetting", () => {
  it("renders a setting from available_payment_settings", () => {
    renderSettings(order())
    expect(screen.getByTestId("name").textContent).toBe("Bank transfer")
    expect(screen.getByTestId("radio")).toBeTruthy()
  })

  // Self-silencing is what lets both payment trees be mounted side by side
  // without a coordinator above them.
  it("renders nothing when the order is on the payment_source model", () => {
    renderSettings(
      order({
        available_payment_settings: [],
        available_payment_methods: [{ id: "pm-1" }],
      } as never)
    )
    expect(screen.queryByTestId("radio")).toBeNull()
  })

  it("renders nothing before the order has loaded", () => {
    renderSettings(null)
    expect(screen.queryByTestId("radio")).toBeNull()
  })

  // A radio for a setting with no implementation behind it does nothing when
  // clicked, which is worse for the shopper than not offering it.
  it("skips settings it cannot drive yet", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    renderSettings(order({ available_payment_settings: [MANUAL, STRIPE] } as never))
    expect(screen.getAllByTestId("name")).toHaveLength(1)
    expect(screen.getByTestId("name").textContent).toBe("Bank transfer")
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("payment_setting_stripes"))
  })

  describe("selection", () => {
    it("creates a Payment Session when the setting is chosen", async () => {
      renderSettings(order())
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })

      await waitFor(() => {
        expect(createPaymentSessionMock).toHaveBeenCalledWith(
          expect.objectContaining({ orderId: "order-1", paymentSettingId: "ps-manual" })
        )
      })
      // The order is the only source of truth for the selection, so it has to
      // be pulled back in before anything reflects the new session.
      expect(getOrder).toHaveBeenCalledWith("order-1")
    })

    it("never sends amount_cents — the server sizes the session", async () => {
      renderSettings(order())
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })
      await waitFor(() => {
        expect(createPaymentSessionMock).toHaveBeenCalled()
      })
      expect(createPaymentSessionMock.mock.calls[0]?.[0]).not.toHaveProperty("amount_cents")
    })

    // Switching setting leaves the previous session on the order — it is never
    // deleted — so the newest one is what the radio group must follow.
    // Otherwise every setting the shopper ever tried reads as selected at once.
    it("follows the most recent session when the order carries several", () => {
      renderSettings(
        order({
          payment_sessions: [
            {
              id: "session-manual",
              status: "unpaid",
              created_at: "2026-08-18T10:00:00Z",
              payment_setting: MANUAL,
            },
            {
              id: "session-other",
              status: "unpaid",
              created_at: "2026-08-18T11:00:00Z",
              payment_setting: STRIPE,
            },
          ],
        } as never)
      )
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(false)
    })

    it("selects the setting whose session is the most recent", () => {
      renderSettings(
        order({
          payment_sessions: [
            {
              id: "session-other",
              status: "unpaid",
              created_at: "2026-08-18T10:00:00Z",
              payment_setting: STRIPE,
            },
            {
              id: "session-manual",
              status: "unpaid",
              created_at: "2026-08-18T11:00:00Z",
              payment_setting: MANUAL,
            },
          ],
        } as never)
      )
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(true)
    })

    // A failed authorization leaves the session `unpaid`, so status alone
    // cannot tell a fresh session from a burnt one.
    it("creates a new session when the existing one carries a failed authorization", async () => {
      renderSettings(
        order({
          payment_sessions: [
            {
              id: "session-1",
              status: "unpaid",
              payment_setting: MANUAL,
              payment_authorization: { status: "failed" },
            },
          ],
        } as never)
      )
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })
      await waitFor(() => {
        expect(createPaymentSessionMock).toHaveBeenCalledOnce()
      })
    })

    it("reads the selection back from the order, not from local state", () => {
      renderSettings(
        order({
          payment_sessions: [{ id: "session-1", status: "unpaid", payment_setting: MANUAL }],
        } as never)
      )
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(true)
      expect(screen.getByTestId("instructions")).toBeTruthy()
    })

    it("does not show the setting as chosen while no session exists", () => {
      renderSettings(order())
      expect((screen.getByTestId("radio") as HTMLInputElement).checked).toBe(false)
      expect(screen.queryByTestId("instructions")).toBeNull()
    })

    it("ignores a click on the setting already chosen", async () => {
      renderSettings(
        order({
          payment_sessions: [{ id: "session-1", status: "unpaid", payment_setting: MANUAL }],
        } as never)
      )
      await act(async () => {
        fireEvent.click(screen.getByTestId("radio"))
      })
      expect(createPaymentSessionMock).not.toHaveBeenCalled()
    })
  })

  // Both trees can be mounted together with no coordinator above them. 2026-05
  // is additive, so an order on the newer model still carries
  // available_payment_methods — without this the shopper would see two sets of
  // payment options, one of them dead.
  describe("precedence over the payment_source tree", () => {
    it("silences <PaymentMethod> on the payment_sessions model", () => {
      render(
        <Wrapper
          currentOrder={
            {
              id: "order-1",
              available_payment_settings: [MANUAL],
              available_payment_methods: [
                { id: "pm-1", payment_source_type: "stripe_payments", name: "Stripe" },
              ],
              payment_sessions: [],
            } as never
          }
        >
          <PaymentMethod>
            <span data-testid="old-tree">old</span>
          </PaymentMethod>
          <PaymentSetting>
            <PaymentSettingName data-testid="name" />
          </PaymentSetting>
        </Wrapper>
      )
      expect(screen.queryByTestId("old-tree")).toBeNull()
      expect(screen.getByTestId("name").textContent).toBe("Bank transfer")
    })
  })
})
