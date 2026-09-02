import type { Order } from "@commercelayer/sdk"
import { render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentMethod } from "#components/payment_methods/PaymentMethod"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"

const setPaymentMethod = vi.fn().mockResolvedValue({ order: undefined })
const setPaymentSource = vi.fn().mockResolvedValue(undefined)

const METHOD = { id: "pm-1", payment_source_type: "wire_transfers", name: "Wire Transfer" }
const SETTING = { id: "ps-manual", type: "payment_setting_manuals", name: "Manual" }

function Wrapper({ children, order }: { children: ReactNode; order: Partial<Order> }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider value={{ ...defaultOrderContext, order } as never}>
        <PaymentMethodContext.Provider
          value={
            {
              ...defaultPaymentMethodContext,
              _isProvided: true,
              paymentMethods: [METHOD],
              setPaymentMethod,
              setPaymentSource,
              setLoading: vi.fn(),
            } as never
          }
        >
          {children}
        </PaymentMethodContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("<PaymentMethod> on the payment_sessions model", () => {
  // Returning null from render does NOT stop a mounted component's effects.
  // Without an explicit guard inside them, auto-select writes a payment_method
  // onto the order; the API then drops available_payment_settings, and the
  // order is flipped onto the older model permanently.
  it("does not auto-select behind an inactive tree", async () => {
    render(
      <Wrapper
        order={
          {
            id: "order-1",
            available_payment_methods: [METHOD],
            available_payment_settings: [SETTING],
          } as never
        }
      >
        <PaymentMethod autoSelectSinglePaymentMethod>
          <span data-testid="old-tree">old</span>
        </PaymentMethod>
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.queryByTestId("old-tree")).toBeNull()
    })
    expect(setPaymentMethod).not.toHaveBeenCalled()
    expect(setPaymentSource).not.toHaveBeenCalled()
  })

  it("still auto-selects on the payment_source model", async () => {
    render(
      <Wrapper order={{ id: "order-1", available_payment_methods: [METHOD] } as never}>
        <PaymentMethod autoSelectSinglePaymentMethod>
          <span data-testid="old-tree">old</span>
        </PaymentMethod>
      </Wrapper>
    )

    await waitFor(() => {
      expect(setPaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({ paymentMethodId: "pm-1" })
      )
    })
  })
})
