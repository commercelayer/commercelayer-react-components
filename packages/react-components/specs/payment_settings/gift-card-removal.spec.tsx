import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSettingGiftCard } from "#components/payment_settings/PaymentSettingGiftCard"
import { PaymentSettingGiftCardList } from "#components/payment_settings/PaymentSettingGiftCardList"
import { PaymentSettingGiftCardListItem } from "#components/payment_settings/PaymentSettingGiftCardListItem"
import { PaymentSettingGiftCardRemoveButton } from "#components/payment_settings/PaymentSettingGiftCardRemoveButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const { refundGiftCardSessionsMock, removeGiftCardMock } = vi.hoisted(() => ({
  refundGiftCardSessionsMock: vi.fn(),
  removeGiftCardMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    refundGiftCardSessions: refundGiftCardSessionsMock,
    removeGiftCard: removeGiftCardMock,
  }
})

const GIFT_CARD = { id: "ps-gift", type: "payment_setting_gift_cards", name: "Gift card" }
const SETTLED = { payment_authorization: { status: "succeeded" } }

function giftCardSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "gc-1",
    status: "unpaid",
    amount_cents: 2000,
    formatted_amount: "$20.00",
    gift_card_code: "CODE-1",
    payment_setting: GIFT_CARD,
    ...overrides,
  }
}

function order(overrides: Record<string, unknown> = {}): Partial<Order> {
  return {
    id: "order-1",
    status: "pending",
    total_amount_with_taxes_cents: 7100,
    available_payment_settings: [GIFT_CARD],
    payment_sessions: [giftCardSession()],
    ...overrides,
  } as Partial<Order>
}

const getOrder = vi.fn()
const seen: { removal?: string; isRemoving?: boolean } = {}

function Wrapper({
  children,
  currentOrder,
}: {
  children: ReactNode
  currentOrder: Partial<Order>
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as never}>
      <OrderContext.Provider
        value={{ ...defaultOrderContext, order: currentOrder, getOrder } as never}
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderList(currentOrder: Partial<Order> = order()) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSettingGiftCard>
        <PaymentSettingGiftCardList>
          <PaymentSettingGiftCardListItem>
            {({ removal, isRemoving }) => {
              seen.removal = removal
              seen.isRemoving = isRemoving
              return (
                <div data-testid="row">
                  <PaymentSettingGiftCardRemoveButton data-testid="remove" />
                </div>
              )
            }}
          </PaymentSettingGiftCardListItem>
        </PaymentSettingGiftCardList>
      </PaymentSettingGiftCard>
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  seen.removal = undefined
  seen.isRemoving = undefined
  removeGiftCardMock.mockResolvedValue(undefined)
  refundGiftCardSessionsMock.mockResolvedValue({
    refundedSessionIds: ["gc-1"],
    errors: [],
    timedOut: false,
  })
  getOrder.mockResolvedValue(order())
})

describe("removing a gift card that took no money", () => {
  it("discards it, without a refund", async () => {
    renderList()

    expect(seen.removal).toBe("discard")
    await act(async () => {
      fireEvent.click(screen.getByTestId("remove"))
    })

    expect(removeGiftCardMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionId: "gc-1" })
    )
    expect(refundGiftCardSessionsMock).not.toHaveBeenCalled()
  })
})

describe("removing a gift card that has been charged", () => {
  const charged = () =>
    order({ payment_sessions: [giftCardSession({ ...SETTLED, status: "paid" })] })

  it("refunds it instead of trying a delete the API would refuse", async () => {
    // A session with transactions attached cannot be deleted — the API raises
    // and surfaces it as an unhandled 500 — so the refund is the only route.
    renderList(charged())

    expect(seen.removal).toBe("refund")
    await act(async () => {
      fireEvent.click(screen.getByTestId("remove"))
    })

    expect(refundGiftCardSessionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ paymentSessionIds: ["gc-1"] })
    )
    expect(removeGiftCardMock).not.toHaveBeenCalled()
  })

  it("does not delete the session afterwards", async () => {
    // Nothing has to hide the row: the session lands on `refunded`, and that
    // status is what drops it out of the applied list and puts the amount back
    // into the remainder.
    renderList(charged())
    await act(async () => {
      fireEvent.click(screen.getByTestId("remove"))
    })

    expect(removeGiftCardMock).not.toHaveBeenCalled()
    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("marks the whole row busy while the refund runs, not just the button", async () => {
    // A discard is one request; a refund waits on a background job and then
    // polls for it. The row is where an application can say so.
    let release: () => void = () => {}
    refundGiftCardSessionsMock.mockImplementation(
      async () =>
        await new Promise((resolve) => {
          release = () => {
            resolve({ refundedSessionIds: ["gc-1"], errors: [], timedOut: false })
          }
        })
    )
    renderList(charged())

    expect(seen.isRemoving).toBe(false)
    await act(async () => {
      fireEvent.click(screen.getByTestId("remove"))
    })
    expect(seen.isRemoving).toBe(true)

    await act(async () => {
      release()
    })
    await waitFor(() => {
      expect(seen.isRemoving).toBe(false)
    })
  })
})

describe("when a gift card cannot come off at all", () => {
  it("renders no control once the order has been placed", async () => {
    // A storefront token's refund grant names `pending` exactly. This is the
    // timed-out place — the shopper's cards are charged and a storefront
    // cannot give the money back.
    renderList(
      order({
        status: "placed",
        payment_sessions: [giftCardSession({ ...SETTLED, status: "paid" })],
      })
    )

    expect(seen.removal).toBeUndefined()
    expect(screen.queryByTestId("remove")).toBeNull()
    // The card itself stays on screen: it is a payment in place, and hiding it
    // would leave the shopper unable to explain why less is owed.
    expect(screen.getByTestId("row")).toBeTruthy()
  })

  it("renders no control while the charge is still settling", async () => {
    // Neither route is open for those few seconds: the delete would be refused
    // and the refund has no capture to point at yet.
    renderList(
      order({
        payment_sessions: [giftCardSession({ payment_authorization: { status: "pending" } })],
      })
    )

    expect(seen.removal).toBeUndefined()
    expect(screen.queryByTestId("remove")).toBeNull()
  })

  it("renders no control in a readonly subtree", async () => {
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSettingGiftCard readonly>
          <PaymentSettingGiftCardList>
            <PaymentSettingGiftCardListItem>
              {({ removal }) => {
                seen.removal = removal
                return <PaymentSettingGiftCardRemoveButton data-testid="remove" />
              }}
            </PaymentSettingGiftCardListItem>
          </PaymentSettingGiftCardList>
        </PaymentSettingGiftCard>
      </Wrapper>
    )

    expect(seen.removal).toBeUndefined()
    expect(screen.queryByTestId("remove")).toBeNull()
  })
})

describe("when the refund does not go through", () => {
  it("shows the API's own refusal", async () => {
    refundGiftCardSessionsMock.mockResolvedValue({
      refundedSessionIds: [],
      errors: [{ code: "VALIDATION_ERROR", message: "Refund amount exceeds the capture." }],
      timedOut: false,
    })
    render(
      <Wrapper
        currentOrder={order({
          payment_sessions: [giftCardSession({ ...SETTLED, status: "paid" })],
        })}
      >
        <PaymentSettingGiftCard>
          {({ errors }) => (
            <>
              <span data-testid="errors">{errors.map((e) => e.message).join(" ")}</span>
              <PaymentSettingGiftCardList>
                <PaymentSettingGiftCardListItem>
                  {() => <PaymentSettingGiftCardRemoveButton data-testid="remove" />}
                </PaymentSettingGiftCardListItem>
              </PaymentSettingGiftCardList>
            </>
          )}
        </PaymentSettingGiftCard>
      </Wrapper>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("remove"))
    })

    await waitFor(() => {
      expect(screen.getByTestId("errors").textContent).toBe("Refund amount exceeds the capture.")
    })
  })

  it("says nothing to the shopper on a timeout, and leaves the card charged", async () => {
    // Nothing was refused — the capture had not appeared. The card is still
    // applied and still charged, which is the truth, and inventing copy here
    // would put payment wording in a package that cannot know the locale.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    refundGiftCardSessionsMock.mockResolvedValue({
      refundedSessionIds: [],
      errors: [],
      timedOut: true,
    })
    render(
      <Wrapper
        currentOrder={order({
          payment_sessions: [giftCardSession({ ...SETTLED, status: "paid" })],
        })}
      >
        <PaymentSettingGiftCard>
          {({ errors }) => (
            <>
              <span data-testid="errors">{errors.map((e) => e.message).join(" ")}</span>
              <PaymentSettingGiftCardList>
                <PaymentSettingGiftCardListItem>
                  {() => <PaymentSettingGiftCardRemoveButton data-testid="remove" />}
                </PaymentSettingGiftCardListItem>
              </PaymentSettingGiftCardList>
            </>
          )}
        </PaymentSettingGiftCard>
      </Wrapper>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("remove"))
    })

    expect(screen.getByTestId("errors").textContent).toBe("")
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("gave up waiting for the capture"))
  })
})
