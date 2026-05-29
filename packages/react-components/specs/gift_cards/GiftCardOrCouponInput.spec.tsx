import { render, screen } from "@testing-library/react"
import { GiftCardOrCouponInput } from "#components/gift_cards/GiftCardOrCouponInput"
import CouponAndGiftCardFormContext from "#context/CouponAndGiftCardFormContext"

describe("GiftCardOrCouponInput", () => {
  it("returns null when no active code type is available", () => {
    const placeholderTranslation = vi.fn()
    render(
      <CouponAndGiftCardFormContext.Provider value={{}}>
        <GiftCardOrCouponInput placeholderTranslation={placeholderTranslation} />
      </CouponAndGiftCardFormContext.Provider>
    )

    expect(screen.queryByRole("textbox")).toBeNull()
    expect(placeholderTranslation).not.toHaveBeenCalled()
  })

  it("renders a translated input bound to the active code type", () => {
    const placeholderTranslation = vi.fn().mockReturnValue("Enter coupon")
    render(
      <CouponAndGiftCardFormContext.Provider value={{ codeType: "coupon_code" }}>
        <GiftCardOrCouponInput
          data-testid="code-input"
          name="gift_card_code"
          value="SAVE10"
          placeholderTranslation={placeholderTranslation}
        />
      </CouponAndGiftCardFormContext.Provider>
    )

    const input = screen.getByTestId("code-input") as HTMLInputElement
    expect(placeholderTranslation).toHaveBeenCalledWith("coupon_code")
    expect(input.type).toBe("text")
    expect(input.name).toBe("coupon_code")
    expect(input.defaultValue).toBe("SAVE10")
    expect(input.placeholder).toBe("Enter coupon")
    expect(input.required).toBe(true)
  })

  it("respects explicit placeholder and required=false", () => {
    render(
      <CouponAndGiftCardFormContext.Provider value={{ codeType: "gift_card_code" }}>
        <GiftCardOrCouponInput placeholder="Gift card code" required={false} />
      </CouponAndGiftCardFormContext.Provider>
    )

    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input.name).toBe("gift_card_code")
    expect(input.placeholder).toBe("Gift card code")
    expect(input.required).toBe(false)
  })
})
