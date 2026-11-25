// #984: on the payment_sessions model the place button never sent the address book flags
// the checkout keeps in localStorage, so a signed-in customer's "save to address book" was
// lost. They go out before anything is collected, because a setting with `auto_place` can
// place the order while the shopper is away on a redirect and never comes back to a place
// of ours. They go out again once the order is placed, which covers a collection nobody
// clicked for and retries a flag refused the first time. The API saves the address on a
// placed order as well, and each flag is cleared once accepted, so none goes out twice.
import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PlaceOrderButtonPaymentSessions } from "#components/orders/PlaceOrderButtonPaymentSessions"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import {
  type PaymentGatewaySubmitResult,
  registerGatewayCollection,
  registerHostCollection,
  resetPaymentGatewayStore,
  setOutOfBandCollection,
} from "#utils/paymentGatewayStore"
import { resetTermsAcceptanceStore } from "#utils/termsAcceptanceStore"

const { authorizeGiftCardsMock, discardPaymentSessionMock, placeOrderMock, orders } = vi.hoisted(
  () => ({
    authorizeGiftCardsMock: vi.fn(),
    discardPaymentSessionMock: vi.fn(),
    placeOrderMock: vi.fn(),
    orders: { update: vi.fn() },
  })
)

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    authorizeGiftCardSessions: authorizeGiftCardsMock,
    discardPaymentSession: discardPaymentSessionMock,
    placeOrderWithPaymentSessions: placeOrderMock,
    getSdk: vi.fn().mockReturnValue({ orders }),
  }
})

vi.mock("#utils/organization", () => ({ useOrganizationConfig: () => ({ urls: {} }) }))

const BILLING = "_save_billing_address_to_customer_address_book"
const SHIPPING = "_save_shipping_address_to_customer_address_book"
const SAVE_BILLING = { id: "order-1", [BILLING]: true }
const SAVE_SHIPPING = { id: "order-1", [SHIPPING]: true }
const ACCESS_DENIED = {
  errors: [{ code: "FORBIDDEN", title: "Access denied", status: "401" }],
}

const ADYEN = { id: "ps-adyen", type: "payment_setting_adyens" }
const ORDER = {
  id: "order-1",
  status: "pending",
  total_amount_with_taxes_cents: 7100,
  available_payment_settings: [ADYEN],
  payment_sessions: [{ id: "session-adyen", status: "unpaid", payment_setting: ADYEN }],
} as unknown as Order

const setOrderErrors = vi.fn()
const getOrder = vi.fn()
const onClick = vi.fn()

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={{ ...defaultOrderContext, order: ORDER, setOrderErrors, getOrder } as never}
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderButton() {
  return render(
    <Wrapper>
      <PlaceOrderButtonPaymentSessions data-testid="place" label="Place order" onClick={onClick} />
    </Wrapper>
  )
}

function useFakeGateway(result: PaymentGatewaySubmitResult) {
  const submit = vi.fn(async () => result)
  registerHostCollection("order-1", submit)
  return submit
}

async function clickPlace() {
  await act(async () => {
    fireEvent.click(screen.getByTestId("place"))
  })
}

const updates = () => orders.update.mock.calls.map(([attributes]) => attributes)

function checkBoth(): void {
  localStorage.setItem(BILLING, "true")
  localStorage.setItem(SHIPPING, "true")
}

beforeEach(() => {
  vi.clearAllMocks()
  orders.update.mockReset()
  orders.update.mockResolvedValue(ORDER)
  localStorage.clear()
  resetPaymentGatewayStore()
  resetTermsAcceptanceStore()
  authorizeGiftCardsMock.mockResolvedValue({ authorizedSessionIds: [], errors: [] })
  discardPaymentSessionMock.mockResolvedValue(true)
  placeOrderMock.mockResolvedValue({ placed: true, order: ORDER, errors: [] })
  getOrder.mockResolvedValue(ORDER)
})

describe("the payment_sessions place button saves to the address book", () => {
  it("sends the flags before the gift cards and the gateway, and clears them", async () => {
    checkBoth()
    const submit = useFakeGateway({ status: "completed" })
    renderButton()

    await clickPlace()

    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING])
    const lastFlag = orders.update.mock.invocationCallOrder[1] as number
    expect(lastFlag).toBeLessThan(authorizeGiftCardsMock.mock.invocationCallOrder[0] as number)
    expect(lastFlag).toBeLessThan(submit.mock.invocationCallOrder[0] as number)
    expect(localStorage.getItem(BILLING)).toBe("false")
    expect(localStorage.getItem(SHIPPING)).toBe("false")
  })

  it("sends them when the order is placed with no gateway at all", async () => {
    // A manual setting, or gift cards covering the whole order.
    checkBoth()
    renderButton()

    await clickPlace()

    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING])
    expect(placeOrderMock).toHaveBeenCalledTimes(1)
  })

  it("sends them even when the gateway refuses the card", async () => {
    // Out before the collection, so a redirect the shopper never comes back from still
    // saved the address; the refusal that follows does not take it back.
    checkBoth()
    useFakeGateway({ status: "failed", code: "Refused" })
    renderButton()

    await clickPlace()

    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING])
    expect(placeOrderMock).not.toHaveBeenCalled()
  })

  it("sends nothing when no flag is set", async () => {
    useFakeGateway({ status: "completed" })
    renderButton()

    await clickPlace()

    expect(orders.update).not.toHaveBeenCalled()
    expect(placeOrderMock).toHaveBeenCalledTimes(1)
  })

  it("sends them when a gateway's own button collected and nothing was clicked", async () => {
    checkBoth()
    registerGatewayCollection("order-1")
    renderButton()

    await act(async () => {
      setOutOfBandCollection("order-1", "done")
    })

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledWith({ placed: true, order: ORDER })
    })
    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING])
    // Before the app hears the order is placed: it may leave the checkout on that callback.
    const lastFlag = orders.update.mock.invocationCallOrder[1] as number
    expect(lastFlag).toBeLessThan(onClick.mock.invocationCallOrder[0] as number)
  })

  it("sends a flag refused before the collection again once the order is placed", async () => {
    checkBoth()
    useFakeGateway({ status: "completed" })
    orders.update.mockRejectedValueOnce(ACCESS_DENIED)
    renderButton()

    await clickPlace()

    // Billing refused, which stops that send before shipping; both go out after the place.
    expect(updates()).toEqual([SAVE_BILLING, SAVE_BILLING, SAVE_SHIPPING])
    expect(localStorage.getItem(SHIPPING)).toBe("false")
    expect(localStorage.getItem(BILLING)).toBe("false")
    expect(onClick).toHaveBeenCalledWith({ placed: true, order: ORDER })
  })

  it("still places, and reports no error, when every save is refused", async () => {
    localStorage.setItem(BILLING, "true")
    useFakeGateway({ status: "completed" })
    orders.update.mockRejectedValue(ACCESS_DENIED)
    renderButton()

    await clickPlace()

    expect(placeOrderMock).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith({ placed: true, order: ORDER })
    expect(setOrderErrors).not.toHaveBeenCalledWith(expect.arrayContaining([expect.anything()]))
    // Never accepted, so not cleared.
    expect(localStorage.getItem(BILLING)).toBe("true")
  })

  it("does not send a flag again on a second click once it was accepted", async () => {
    checkBoth()
    useFakeGateway({ status: "failed", code: "Refused" })
    renderButton()

    await clickPlace()
    await clickPlace()

    expect(updates()).toEqual([SAVE_BILLING, SAVE_SHIPPING])
  })
})
