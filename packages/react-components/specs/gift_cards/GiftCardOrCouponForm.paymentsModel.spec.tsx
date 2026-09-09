import type { Order } from "@commercelayer/sdk"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import GiftCardOrCouponForm from "#components/gift_cards/GiftCardOrCouponForm"
import GiftCardOrCouponInput from "#components/gift_cards/GiftCardOrCouponInput"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

vi.mock("rapid-form", () => ({
  useRapidForm: () => ({ refValidation: vi.fn(), values: {} }),
}))

const MANUAL = { id: "ps-manual", type: "payment_setting_manuals" }

function Wrapper({ children, order }: { children: ReactNode; order: Partial<Order> }) {
  return (
    <OrderContext.Provider value={{ ...defaultOrderContext, order } as never}>
      {children}
    </OrderContext.Provider>
  )
}

function renderForm(order: Partial<Order>, codeType?: "gift_card_code" | "coupon_code") {
  return render(
    <Wrapper order={order}>
      <GiftCardOrCouponForm codeType={codeType}>
        <GiftCardOrCouponInput data-testid="input" />
      </GiftCardOrCouponForm>
    </Wrapper>
  )
}

const inputName = () => (screen.getByTestId("input") as HTMLInputElement).name

describe("GiftCardOrCouponForm on the payment_sessions model", () => {
  // On this model a gift card is spent by creating a Payment Session against a
  // gift-card Payment Setting, so it belongs among the payment methods. The
  // order-level code field would apply a gift card no session reflects.
  it("offers only the coupon", () => {
    renderForm({ id: "order-1", available_payment_settings: [MANUAL] } as never)
    expect(inputName()).toBe("coupon_code")
  })

  it("overrides an explicit gift_card_code request", () => {
    renderForm({ id: "order-1", available_payment_settings: [MANUAL] } as never, "gift_card_code")
    expect(inputName()).toBe("coupon_code")
  })

  // A leftover gift card code from the older model must not hide the coupon
  // form, since the requested type is no longer what gets rendered.
  it("still renders when the order carries a stale gift card code", () => {
    renderForm(
      {
        id: "order-1",
        available_payment_settings: [MANUAL],
        gift_card_code: "OLD-CARD",
      } as never,
      "gift_card_code"
    )
    expect(inputName()).toBe("coupon_code")
  })

  it("leaves the payment_source model untouched", () => {
    renderForm({ id: "order-1", available_payment_methods: [{ id: "pm-1" }] } as never)
    expect(inputName()).toBe("gift_card_or_coupon_code")
  })
})
