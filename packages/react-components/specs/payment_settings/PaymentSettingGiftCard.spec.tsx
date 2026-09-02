import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PaymentSetting } from "#components/payment_settings/PaymentSetting"
import { PaymentSettingGiftCard } from "#components/payment_settings/PaymentSettingGiftCard"
import { PaymentSettingGiftCardErrors } from "#components/payment_settings/PaymentSettingGiftCardErrors"
import { PaymentSettingGiftCardInput } from "#components/payment_settings/PaymentSettingGiftCardInput"
import { PaymentSettingGiftCardList } from "#components/payment_settings/PaymentSettingGiftCardList"
import { PaymentSettingGiftCardListItem } from "#components/payment_settings/PaymentSettingGiftCardListItem"
import { PaymentSettingGiftCardRemoveButton } from "#components/payment_settings/PaymentSettingGiftCardRemoveButton"
import { PaymentSettingGiftCardSubmitButton } from "#components/payment_settings/PaymentSettingGiftCardSubmitButton"
import { PaymentSettingName } from "#components/payment_settings/PaymentSettingName"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const { applyGiftCardMock, removeGiftCardMock } = vi.hoisted(() => ({
  applyGiftCardMock: vi.fn(),
  removeGiftCardMock: vi.fn(),
}))

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return { ...actual, applyGiftCard: applyGiftCardMock, removeGiftCard: removeGiftCardMock }
})

const MANUAL = { id: "ps-manual", type: "payment_setting_manuals", name: "Bank transfer" }
const GIFT_CARD = { id: "ps-gift", type: "payment_setting_gift_cards", name: "Gift card" }
const TOTAL = 7100

function giftCardSession(id: string, amountCents: number, overrides = {}) {
  return {
    id,
    status: "unpaid",
    amount_cents: amountCents,
    formatted_amount: `$${(amountCents / 100).toFixed(2)}`,
    gift_card_code: `CODE-${id}`,
    payment_setting: GIFT_CARD,
    ...overrides,
  }
}

function order(overrides: Partial<Order> = {}): Partial<Order> {
  return {
    id: "order-1",
    currency_code: "USD",
    total_amount_with_taxes_cents: TOTAL,
    available_payment_settings: [MANUAL, GIFT_CARD],
    payment_sessions: [],
    ...overrides,
  } as Partial<Order>
}

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
            include: ["payment_sessions.payment_setting", "payment_sessions.payment_authorization"],
            includeLoaded: {
              "payment_sessions.payment_setting": true,
              "payment_sessions.payment_authorization": true,
            },
            addResourceToInclude: vi.fn(),
            getOrder,
          } as never
        }
      >
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderGiftCards(currentOrder: Partial<Order> | null = order(), readonly = false) {
  return render(
    <Wrapper currentOrder={currentOrder}>
      <PaymentSettingGiftCard readonly={readonly}>
        <PaymentSettingGiftCardList>
          <PaymentSettingGiftCardListItem data-testid="row" />
          <PaymentSettingGiftCardRemoveButton data-testid="remove" />
        </PaymentSettingGiftCardList>
        <PaymentSettingGiftCardInput data-testid="input" />
        <PaymentSettingGiftCardSubmitButton data-testid="apply" />
      </PaymentSettingGiftCard>
    </Wrapper>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  applyGiftCardMock.mockResolvedValue({ id: "gift-new" })
  removeGiftCardMock.mockResolvedValue(undefined)
})

describe("PaymentSettingGiftCard", () => {
  it("renders nothing on the payment_source model", () => {
    renderGiftCards(
      order({
        available_payment_settings: [],
        available_payment_methods: [{ id: "pm-1" }],
      } as never)
    )
    expect(screen.queryByTestId("input")).toBeNull()
  })

  it("renders nothing when the order has no gift card setting", () => {
    renderGiftCards(order({ available_payment_settings: [MANUAL] } as never))
    expect(screen.queryByTestId("input")).toBeNull()
  })

  it("shows the input straight away when nothing is applied", () => {
    renderGiftCards()
    expect(screen.getByTestId("input")).toBeTruthy()
  })

  it("applies a typed code", async () => {
    renderGiftCards()

    await act(async () => {
      fireEvent.change(screen.getByTestId("input"), { target: { value: " ABC " } })
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId("apply"))
    })

    await waitFor(() => {
      expect(applyGiftCardMock).toHaveBeenCalledWith(
        expect.objectContaining({ giftCardCode: "ABC" })
      )
    })
    expect(getOrder).toHaveBeenCalledWith("order-1")
  })

  it("keeps apply disabled until something is typed", () => {
    renderGiftCards()
    expect((screen.getByTestId("apply") as HTMLButtonElement).disabled).toBe(true)
  })

  // Selection errors live on this component's own context, kept apart from the
  // method's: a gift card failure must never surface under the payment method.
  it("reports a failed code without touching the order", async () => {
    applyGiftCardMock.mockRejectedValue(new Error("doesn't match any active gift card"))
    render(
      <Wrapper currentOrder={order()}>
        <PaymentSettingGiftCard>
          <PaymentSettingGiftCardInput data-testid="input" />
          <PaymentSettingGiftCardSubmitButton data-testid="apply" />
        </PaymentSettingGiftCard>
      </Wrapper>
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId("input"), { target: { value: "NOPE" } })
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId("apply"))
    })

    await waitFor(() => {
      expect(applyGiftCardMock).toHaveBeenCalled()
    })
    expect(getOrder).not.toHaveBeenCalled()
  })

  // Without a component of its own the failure is invisible: these errors are
  // rejected before anything is written to the order, so <Errors resource=
  // "orders"> never sees them and the shopper gets a control that silently
  // does nothing.
  describe("errors", () => {
    function renderWithErrors() {
      return render(
        <Wrapper currentOrder={order()}>
          <PaymentSettingGiftCard>
            <PaymentSettingGiftCardInput data-testid="input" />
            <PaymentSettingGiftCardSubmitButton data-testid="apply" />
            <PaymentSettingGiftCardErrors data-testid="gift-card-error" />
          </PaymentSettingGiftCard>
        </Wrapper>
      )
    }

    async function submit(code: string) {
      await act(async () => {
        fireEvent.change(screen.getByTestId("input"), { target: { value: code } })
      })
      await act(async () => {
        fireEvent.click(screen.getByTestId("apply"))
      })
    }

    it("renders nothing while there is nothing to report", () => {
      renderWithErrors()
      expect(screen.queryByTestId("gift-card-error")).toBeNull()
    })

    // The SDK throws with an empty `message`; the API's wording is only in the
    // JSON:API errors array, so reading `message` renders an empty box.
    it("shows the API message when a code is refused", async () => {
      applyGiftCardMock.mockRejectedValue({
        errors: [
          {
            title: "doesn't match any active gift card",
            detail: "gift_card_code - doesn't match any active gift card",
            code: "VALIDATION_ERROR",
            source: { pointer: "/data/attributes/gift_card_code" },
            meta: { error: "invalid_gift_card" },
          },
          {
            title: "can't be blank",
            detail: "token - can't be blank",
            code: "VALIDATION_ERROR",
            source: { pointer: "/data/attributes/token" },
          },
        ],
      })
      renderWithErrors()

      await submit("NOPE")

      await waitFor(() => {
        expect(screen.getByTestId("gift-card-error").textContent).toBe(
          "doesn't match any active gift card"
        )
      })
    })

    it("falls back to a message of its own when the failure never reached the API", async () => {
      applyGiftCardMock.mockRejectedValue(new Error("Network request failed"))
      renderWithErrors()

      await submit("NOPE")

      await waitFor(() => {
        expect(screen.getByTestId("gift-card-error").textContent).toBe("Network request failed")
      })
    })

    it("clears the message once a later code is accepted", async () => {
      applyGiftCardMock.mockRejectedValueOnce(new Error("Network request failed"))
      renderWithErrors()

      await submit("NOPE")
      await waitFor(() => {
        expect(screen.queryByTestId("gift-card-error")).not.toBeNull()
      })

      applyGiftCardMock.mockResolvedValue({ id: "gift-new" })
      await submit("GOOD")

      await waitFor(() => {
        expect(screen.queryByTestId("gift-card-error")).toBeNull()
      })
    })
  })

  describe("the applied list", () => {
    it("renders one row per applied card, with code and amount", () => {
      renderGiftCards(
        order({
          payment_sessions: [giftCardSession("gift-a", 2000), giftCardSession("gift-b", 1500)],
        } as never)
      )
      const rows = screen.getAllByTestId("row")
      expect(rows).toHaveLength(2)
      expect(rows[0]?.textContent).toContain("CODE-gift-a")
      expect(rows[0]?.textContent).toContain("$20.00")
    })

    // A burnt card took no money; listing it would say a payment is in place.
    it("leaves out a card whose authorization failed", () => {
      renderGiftCards(
        order({
          payment_sessions: [
            giftCardSession("gift-a", 2000, { payment_authorization: { status: "failed" } }),
          ],
        } as never)
      )
      expect(screen.queryByTestId("row")).toBeNull()
    })

    it("removes a card", async () => {
      renderGiftCards(order({ payment_sessions: [giftCardSession("gift-a", 2000)] } as never))

      await act(async () => {
        fireEvent.click(screen.getByTestId("remove"))
      })

      await waitFor(() => {
        expect(removeGiftCardMock).toHaveBeenCalledWith(
          expect.objectContaining({ paymentSessionId: "gift-a" })
        )
      })
    })

    // Authorizing debits the balance immediately and only a refund would give
    // it back, which this iteration does not implement.
    it("hides remove once the card has been charged", () => {
      renderGiftCards(
        order({
          payment_sessions: [
            giftCardSession("gift-a", 2000, { payment_authorization: { status: "succeeded" } }),
          ],
        } as never)
      )
      expect(screen.getByTestId("row")).toBeTruthy()
      expect(screen.queryByTestId("remove")).toBeNull()
    })
  })

  // Whether the field is on screen is the application's business — this
  // component holds no disclosure state — but *whether it may be offered at
  // all* is a domain rule, and stays here.
  describe("adding another", () => {
    it("keeps offering the input after the first card", () => {
      renderGiftCards(order({ payment_sessions: [giftCardSession("gift-a", 2000)] } as never))
      expect(screen.getByTestId("input")).toBeTruthy()
      expect(screen.getByTestId("apply")).toBeTruthy()
    })

    // Applying a card that is not needed fails with a 422 about amount_cents,
    // which a shopper cannot act on.
    it("offers nothing once the gift cards cover the order", () => {
      renderGiftCards(order({ payment_sessions: [giftCardSession("gift-a", TOTAL)] } as never))
      expect(screen.queryByTestId("input")).toBeNull()
      expect(screen.queryByTestId("apply")).toBeNull()
      expect(screen.getByTestId("row")).toBeTruthy()
    })

    // Settling a partially-paid order is a flow this iteration does not
    // implement, so nothing more is accepted once money is taken or in flight.
    it("offers nothing once anything has been authorized", () => {
      renderGiftCards(
        order({
          payment_sessions: [
            giftCardSession("gift-a", 1000, { payment_authorization: { status: "pending" } }),
          ],
        } as never)
      )
      expect(screen.queryByTestId("input")).toBeNull()
      expect(screen.queryByTestId("apply")).toBeNull()
    })

    // The state an application needs to run a disclosure of its own: a toggle
    // that opens by default when a card is already applied, and closes itself
    // once one is accepted.
    it("hands its state to a function child", () => {
      render(
        <Wrapper
          currentOrder={order({ payment_sessions: [giftCardSession("gift-a", 2000)] } as never)}
        >
          <PaymentSettingGiftCard>
            {({ giftCardSessions, canAddGiftCard, isCovered, remainingAmountCents }) => (
              <div data-testid="state">
                {`${giftCardSessions.length}|${canAddGiftCard}|${isCovered}|${remainingAmountCents}`}
              </div>
            )}
          </PaymentSettingGiftCard>
        </Wrapper>
      )
      expect(screen.getByTestId("state").textContent).toBe(`1|true|false|${TOTAL - 2000}`)
    })
  })

  describe("readonly", () => {
    it("shows the applied cards without any controls", () => {
      renderGiftCards(order({ payment_sessions: [giftCardSession("gift-a", 2000)] } as never), true)
      expect(screen.getByTestId("row")).toBeTruthy()
      expect(screen.queryByTestId("remove")).toBeNull()
      expect(screen.queryByTestId("input")).toBeNull()
    })
  })
})

describe("PaymentSetting alongside gift cards", () => {
  function renderBoth(currentOrder: Partial<Order>, readonly = false) {
    return render(
      <Wrapper currentOrder={currentOrder}>
        <PaymentSetting readonly={readonly}>
          <PaymentSettingName data-testid="setting-name" />
        </PaymentSetting>
      </Wrapper>
    )
  }

  it("offers the payment method while something is still owed", () => {
    renderBoth(order({ payment_sessions: [giftCardSession("gift-a", 2000)] } as never))
    expect(screen.getByTestId("setting-name").textContent).toBe("Bank transfer")
  })

  // Nothing left to pay means nothing to choose.
  it("offers no payment method once the gift cards cover the order", () => {
    renderBoth(order({ payment_sessions: [giftCardSession("gift-a", TOTAL)] } as never))
    expect(screen.queryByTestId("setting-name")).toBeNull()
  })

  // A placed order is covered by definition; hiding what was used defeats the
  // purpose of a recap.
  it("still shows the chosen method in readonly, even when covered", () => {
    renderBoth(
      order({
        payment_sessions: [
          giftCardSession("gift-a", 5100),
          {
            id: "method",
            status: "unpaid",
            amount_cents: 2000,
            payment_setting: MANUAL,
          },
        ],
      } as never),
      true
    )
    expect(screen.getByTestId("setting-name").textContent).toBe("Bank transfer")
  })
})
