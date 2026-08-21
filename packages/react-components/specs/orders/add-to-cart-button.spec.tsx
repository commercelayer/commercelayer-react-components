import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { AddToCartButton } from "#components/orders/AddToCartButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"

function makeOrderCtx(addToCart = vi.fn().mockResolvedValue({ success: true, orderId: "ord-1" })) {
  return {
    ...defaultOrderContext,
    addToCart,
    orderId: "ord-1",
    getOrder: vi.fn().mockResolvedValue(undefined),
    setOrderErrors: vi.fn(),
  }
}

function Wrapper({
  children,
  orderCtx = makeOrderCtx(),
}: {
  children: React.ReactNode
  orderCtx?: ReturnType<typeof makeOrderCtx>
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: FAKE_TOKEN }}>
      <OrderContext.Provider value={orderCtx}>{children}</OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("AddToCartButton", () => {
  it("renders a button with the default label", () => {
    render(
      <Wrapper>
        <AddToCartButton skuCode="SKU1" />
      </Wrapper>
    )
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeDefined()
  })

  it("renders a custom string label", () => {
    render(
      <Wrapper>
        <AddToCartButton skuCode="SKU1" label="Buy now" />
      </Wrapper>
    )
    expect(screen.getByRole("button", { name: /buy now/i })).toBeDefined()
  })

  it("calls addToCart with skuCode and default quantity when clicked", async () => {
    const addToCart = vi.fn().mockResolvedValue({ success: true, orderId: "ord-1" })
    render(
      <Wrapper orderCtx={makeOrderCtx(addToCart)}>
        <AddToCartButton skuCode="SKU1" />
      </Wrapper>
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith(
        expect.objectContaining({ skuCode: "SKU1", quantity: 1 })
      )
    })
  })

  it("calls addToCart with custom quantity", async () => {
    const addToCart = vi.fn().mockResolvedValue({ success: true, orderId: "ord-1" })
    render(
      <Wrapper orderCtx={makeOrderCtx(addToCart)}>
        <AddToCartButton skuCode="SKU1" quantity="3" />
      </Wrapper>
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith(
        expect.objectContaining({ skuCode: "SKU1", quantity: 3 })
      )
    })
  })

  it("calls addToCart with bundleCode when provided", async () => {
    const addToCart = vi.fn().mockResolvedValue({ success: true, orderId: "ord-1" })
    render(
      <Wrapper orderCtx={makeOrderCtx(addToCart)}>
        <AddToCartButton bundleCode="BUNDLE1" />
      </Wrapper>
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ bundleCode: "BUNDLE1" }))
    })
  })

  it("disables the button while addToCart is in progress and re-enables after", async () => {
    let resolve!: (value: { success: boolean; orderId: string }) => void
    const addToCart = vi.fn().mockReturnValue(
      new Promise<{ success: boolean; orderId: string }>((res) => {
        resolve = res
      })
    )
    render(
      <Wrapper orderCtx={makeOrderCtx(addToCart)}>
        <AddToCartButton skuCode="SKU1" />
      </Wrapper>
    )
    const button = screen.getByRole("button") as HTMLButtonElement
    fireEvent.click(button)
    await waitFor(() => expect(button.disabled).toBe(true))
    resolve({ success: true, orderId: "ord-1" })
    await waitFor(() => expect(button.disabled).toBe(false))
  })

  it("passes additional HTML button attributes", () => {
    render(
      <Wrapper>
        <AddToCartButton skuCode="SKU1" className="my-btn" data-testid="atc" />
      </Wrapper>
    )
    const button = screen.getByTestId("atc")
    expect((button as HTMLButtonElement).className).toContain("my-btn")
  })

  it("respects the disabled prop", () => {
    render(
      <Wrapper>
        <AddToCartButton skuCode="SKU1" disabled />
      </Wrapper>
    )
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)
  })

  it("renders custom children and passes handleClick to them", async () => {
    const addToCart = vi.fn().mockResolvedValue({ success: true, orderId: "ord-1" })
    render(
      <Wrapper orderCtx={makeOrderCtx(addToCart)}>
        <AddToCartButton skuCode="SKU1">
          {({ handleClick }) => (
            <button
              type="button"
              onClick={() => {
                void handleClick()
              }}
              data-testid="custom"
            >
              custom
            </button>
          )}
        </AddToCartButton>
      </Wrapper>
    )
    fireEvent.click(screen.getByTestId("custom"))
    await waitFor(() => expect(addToCart).toHaveBeenCalled())
  })

  it("throws when rendered outside <CommerceLayer>", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
    expect(() =>
      render(
        <OrderContext.Provider value={makeOrderCtx()}>
          <AddToCartButton skuCode="SKU1" />
        </OrderContext.Provider>
      )
    ).toThrow("Cannot use <AddToCartButton/> outside of <CommerceLayer/>")
    consoleSpy.mockRestore()
  })

  it("throws when rendered outside <OrderContainer>", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
    expect(() =>
      render(
        <CommerceLayerContext.Provider value={{ accessToken: FAKE_TOKEN }}>
          <AddToCartButton skuCode="SKU1" />
        </CommerceLayerContext.Provider>
      )
    ).toThrow("Cannot use <AddToCartButton/> outside of <Order/>")
    consoleSpy.mockRestore()
  })
})
