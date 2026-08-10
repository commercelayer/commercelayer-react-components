import type { Order } from "@commercelayer/sdk"
import { render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdyenPayment from "#components/payment_source/AdyenPayment"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import PaymentMethodContext, {
  defaultPaymentMethodContext,
} from "#context/PaymentMethodContext"
import PlaceOrderContext, {
  defaultPlaceOrderContext,
} from "#context/PlaceOrderContext"
import type { PaymentMethodState } from "#reducers/PaymentMethodReducer"

const removeMock = vi.fn()
const mountMock = vi.fn()
const dropinConstructor = vi.fn()

vi.mock("@adyen/adyen-web/auto", () => {
  return {
    AdyenCheckout: vi.fn(async () => ({})),
    Dropin: class {
      mount = mountMock.mockReturnThis()
      remove = removeMock
      submit = vi.fn()
      handleAction = vi.fn()
      constructor(...args: unknown[]) {
        dropinConstructor(...args)
      }
    },
  }
})

const order = { id: "order_1" } as unknown as Order

function Providers({
  status,
  children,
}: {
  status: "standby" | "placing"
  children: ReactNode
}): ReactNode {
  return (
    <CommerceLayerContext.Provider value={{}}>
      <CustomerContext.Provider value={{}}>
        <OrderContext.Provider value={{ ...defaultOrderContext, order }}>
          <PaymentMethodContext.Provider
            value={{
              ...defaultPaymentMethodContext,
              // Adyen's payment_methods response shape isn't represented in
              // PaymentSourceObject; AdyenPayment itself reads it via
              // `@ts-expect-error` for the same reason.
              paymentSource: {
                payment_methods: {
                  paymentMethods: [{ type: "scheme", name: "Cards" }],
                  storedPaymentMethods: [],
                },
              } as unknown as PaymentMethodState["paymentSource"],
              currentPaymentMethodType:
                "scheme" as PaymentMethodState["currentPaymentMethodType"],
            }}
          >
            <PlaceOrderContext.Provider
              value={{ ...defaultPlaceOrderContext, status }}
            >
              {children}
            </PlaceOrderContext.Provider>
          </PaymentMethodContext.Provider>
        </OrderContext.Provider>
      </CustomerContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("AdyenPayment", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("destroys the Drop-in on unmount, but not on a status-only re-render", async () => {
    const { rerender, unmount } = render(
      <Providers status="standby">
        <AdyenPayment clientKey="test_client_key" />
      </Providers>,
    )

    await waitFor(() => expect(dropinConstructor).toHaveBeenCalledTimes(1))

    // A declined-payment retry flips status standby -> placing -> standby
    // while AdyenPayment stays mounted; that must not tear down the Drop-in.
    rerender(
      <Providers status="placing">
        <AdyenPayment clientKey="test_client_key" />
      </Providers>,
    )
    rerender(
      <Providers status="standby">
        <AdyenPayment clientKey="test_client_key" />
      </Providers>,
    )

    expect(removeMock).not.toHaveBeenCalled()
    expect(dropinConstructor).toHaveBeenCalledTimes(1)

    unmount()

    expect(removeMock).toHaveBeenCalledTimes(1)
  })
})
