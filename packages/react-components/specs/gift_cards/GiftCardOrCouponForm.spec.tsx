import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { GiftCardOrCouponForm } from "#components/gift_cards/GiftCardOrCouponForm"
import CouponAndGiftCardFormContext from "#context/CouponAndGiftCardFormContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const rapidForm = vi.hoisted(() => ({
  useRapidForm: vi.fn(),
}))

vi.mock("rapid-form", () => ({
  useRapidForm: rapidForm.useRapidForm,
}))

function CodeTypeProbe(): JSX.Element {
  const { codeType } = useContext(CouponAndGiftCardFormContext)
  return <div data-testid="code-type">{codeType ?? "none"}</div>
}

function renderComponent({
  codeType,
  onSubmit = vi.fn(),
  orderContextOverrides = {},
}: {
  codeType?: "coupon_code" | "gift_card_code"
  onSubmit?: ReturnType<typeof vi.fn>
  orderContextOverrides?: Record<string, unknown>
}) {
  const setGiftCardOrCouponCode = vi.fn()
  const setOrderErrors = vi.fn()
  const orderContext = {
    ...defaultOrderContext,
    order: {
      id: "order-1",
      gift_card_code: "",
      coupon_code: "",
    },
    errors: [],
    setGiftCardOrCouponCode,
    setOrderErrors,
    ...orderContextOverrides,
  }

  const result = render(
    <OrderContext.Provider value={orderContext as any}>
      <GiftCardOrCouponForm codeType={codeType} onSubmit={onSubmit} data-testid="gift-card-form">
        <CodeTypeProbe />
      </GiftCardOrCouponForm>
    </OrderContext.Provider>
  )

  return {
    ...result,
    onSubmit,
    setGiftCardOrCouponCode,
    setOrderErrors,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  rapidForm.useRapidForm.mockReturnValue({
    refValidation: vi.fn(),
    values: {},
  })
})

describe("GiftCardOrCouponForm", () => {
  it("returns null when no order is available", () => {
    renderComponent({ orderContextOverrides: { order: undefined } })

    expect(screen.queryByTestId("gift-card-form")).toBeNull()
  })

  it("returns null when both gift card and coupon are already set", () => {
    renderComponent({
      orderContextOverrides: {
        order: { id: "order-1", gift_card_code: "GC1", coupon_code: "CP1" },
      },
    })

    expect(screen.queryByTestId("gift-card-form")).toBeNull()
  })

  it("returns null when the requested code type is already present on the order", () => {
    renderComponent({
      codeType: "coupon_code",
      orderContextOverrides: {
        order: { id: "order-1", gift_card_code: "", coupon_code: "CP1" },
      },
    })

    expect(screen.queryByTestId("gift-card-form")).toBeNull()
  })

  it("derives the universal code type when no code is set", async () => {
    const onSubmit = vi.fn()
    const setOrderErrors = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: {
        gift_card_or_coupon_code: { value: "SAVE10" },
      },
    })

    renderComponent({
      onSubmit,
      orderContextOverrides: { setOrderErrors },
    })

    await waitFor(() => {
      expect(screen.getByTestId("code-type").textContent).toBe("gift_card_or_coupon_code")
    })
    expect(screen.getByTestId("gift-card-form").getAttribute("autocomplete")).toBe("on")
    expect(setOrderErrors).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("derives coupon_code when the order already has a gift card", async () => {
    renderComponent({
      orderContextOverrides: {
        order: { id: "order-1", gift_card_code: "GC1", coupon_code: "" },
      },
    })

    await waitFor(() => {
      expect(screen.getByTestId("code-type").textContent).toBe("coupon_code")
    })
  })

  it("derives gift_card_code when the order already has a coupon", async () => {
    renderComponent({
      orderContextOverrides: {
        order: { id: "order-1", gift_card_code: "", coupon_code: "CP1" },
      },
    })

    await waitFor(() => {
      expect(screen.getByTestId("code-type").textContent).toBe("gift_card_code")
    })
  })

  it("uses an explicit code type prop and forwards form attributes", async () => {
    renderComponent({ codeType: "coupon_code" })

    await waitFor(() => {
      expect(screen.getByTestId("code-type").textContent).toBe("coupon_code")
    })
  })

  it("propagates only matching order errors when the active field is empty", async () => {
    const onSubmit = vi.fn()
    const setOrderErrors = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: {
        coupon_code: { value: "" },
      },
    })

    renderComponent({
      codeType: "coupon_code",
      onSubmit,
      orderContextOverrides: {
        errors: [
          { code: "VALIDATION_ERROR", message: "coupon", field: "coupon_code" },
          { code: "VALIDATION_ERROR", message: "gift card", field: "gift_card_code" },
        ],
        setOrderErrors,
      },
    })

    await waitFor(() => {
      expect(setOrderErrors).toHaveBeenCalledWith([
        expect.objectContaining({ field: "coupon_code", message: "coupon" }),
      ])
      expect(onSubmit).toHaveBeenCalledWith({ value: "", success: false })
    })
  })

  it("clears order errors to an empty list when none are present", async () => {
    const setOrderErrors = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: {
        gift_card_code: { value: "" },
      },
    })

    renderComponent({
      codeType: "gift_card_code",
      orderContextOverrides: {
        errors: undefined,
        setOrderErrors,
      },
    })

    await waitFor(() => expect(setOrderErrors).toHaveBeenCalledWith([]))
  })

  it("returns early on submit when the current field value is missing", async () => {
    const { container, setGiftCardOrCouponCode, onSubmit } = renderComponent({
      codeType: "coupon_code",
    })

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(setGiftCardOrCouponCode).not.toHaveBeenCalled()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it("returns early on submit when the setter is unavailable", async () => {
    const onSubmit = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: {
        coupon_code: { value: "SAVE10" },
      },
    })

    const { container } = renderComponent({
      codeType: "coupon_code",
      onSubmit,
      orderContextOverrides: {
        setGiftCardOrCouponCode: undefined,
      },
    })

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled())
  })

  it("submits the active code and resets the form on success", async () => {
    const onSubmit = vi.fn()
    const updatedOrder = { id: "order-2" }
    const resetSpy = vi.spyOn(HTMLFormElement.prototype, "reset")
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: {
        coupon_code: { value: "SAVE10" },
      },
    })

    const { container, setGiftCardOrCouponCode } = renderComponent({
      codeType: "coupon_code",
      onSubmit,
    })
    setGiftCardOrCouponCode.mockResolvedValue({ success: true, order: updatedOrder })

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(setGiftCardOrCouponCode).toHaveBeenCalledWith({
        code: "SAVE10",
        codeType: "coupon_code",
      })
      expect(onSubmit).toHaveBeenCalledWith({
        success: true,
        value: "SAVE10",
        order: updatedOrder,
      })
      expect(resetSpy).toHaveBeenCalled()
    })

    resetSpy.mockRestore()
  })

  it("does not reset the form when submission fails", async () => {
    const onSubmit = vi.fn()
    const resetSpy = vi.spyOn(HTMLFormElement.prototype, "reset")
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: {
        gift_card_code: { value: "GC-123" },
      },
    })

    const { container, setGiftCardOrCouponCode } = renderComponent({
      codeType: "gift_card_code",
      onSubmit,
      orderContextOverrides: {
        order: { id: "order-1", gift_card_code: "", coupon_code: "" },
      },
    })
    setGiftCardOrCouponCode.mockResolvedValue({ success: false, order: undefined })

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(setGiftCardOrCouponCode).toHaveBeenCalledWith({
        code: "GC-123",
        codeType: "gift_card_code",
      })
      expect(onSubmit).toHaveBeenCalledWith({
        success: false,
        value: "GC-123",
        order: undefined,
      })
      expect(resetSpy).not.toHaveBeenCalled()
    })

    resetSpy.mockRestore()
  })
})
