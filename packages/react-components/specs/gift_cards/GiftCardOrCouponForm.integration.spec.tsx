// Integration coverage that exercises the REAL rapid-form wiring (unlike
// GiftCardOrCouponForm.spec.tsx, which mocks `rapid-form` and injects `values`
// directly). rapid-form v4 auto-discovers a form field only when it is `required`
// OR has a validation config; consumers such as mfe-checkout render the input with
// `required={false}`, which used to leave the field untracked so `values[type]`
// stayed undefined and submit never called the API. The form now registers a
// pass-through validation for its active field to force tracking.
import { fireEvent, render, screen } from "@testing-library/react"
import { GiftCardOrCouponForm } from "#components/gift_cards/GiftCardOrCouponForm"
import { GiftCardOrCouponInput } from "#components/gift_cards/GiftCardOrCouponInput"
import { GiftCardOrCouponSubmit } from "#components/gift_cards/GiftCardOrCouponSubmit"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

function renderForm(required: boolean) {
  const setGiftCardOrCouponCode = vi.fn(async () => ({ success: true, order: undefined }))
  render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <OrderContext.Provider
      value={
        {
          ...defaultOrderContext,
          order: { id: "order-1", gift_card_code: "", coupon_code: "" },
          errors: [],
          setGiftCardOrCouponCode,
          setOrderErrors: vi.fn(),
          // biome-ignore lint/suspicious/noExplicitAny: test provider cast
        } as any
      }
    >
      <GiftCardOrCouponForm>
        <GiftCardOrCouponInput data-testid="input" required={required} />
        <GiftCardOrCouponSubmit data-testid="submit" />
      </GiftCardOrCouponForm>
    </OrderContext.Provider>
  )
  return setGiftCardOrCouponCode
}

describe("GiftCardOrCouponForm real rapid-form wiring", () => {
  it("submits a non-required field (mfe-checkout renders required={false})", async () => {
    const setGiftCardOrCouponCode = renderForm(false)
    fireEvent.input(screen.getByTestId("input"), { target: { value: "SUMMER10" } })
    fireEvent.click(screen.getByTestId("submit"))
    await Promise.resolve()
    expect(setGiftCardOrCouponCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SUMMER10", codeType: "gift_card_or_coupon_code" })
    )
  })

  it("submits a required field", async () => {
    const setGiftCardOrCouponCode = renderForm(true)
    fireEvent.input(screen.getByTestId("input"), { target: { value: "SUMMER10" } })
    fireEvent.click(screen.getByTestId("submit"))
    await Promise.resolve()
    expect(setGiftCardOrCouponCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SUMMER10" })
    )
  })

  it("does not call the API when submitting without typing", async () => {
    const setGiftCardOrCouponCode = renderForm(false)
    fireEvent.click(screen.getByTestId("submit"))
    await Promise.resolve()
    expect(setGiftCardOrCouponCode).not.toHaveBeenCalled()
  })
})
