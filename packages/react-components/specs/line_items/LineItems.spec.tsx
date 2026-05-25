import { render, screen, act } from "@testing-library/react"
import { useContext } from "react"
import { vi, beforeEach, describe, it, expect } from "vitest"
import { LineItems } from "#components/line_items/LineItems"
import CommerceLayerContext from "#context/CommerceLayerContext"
import LineItemContext from "#context/LineItemContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const MOCK_LINE_ITEMS = [
  { id: "li_1", item_type: "skus", quantity: 2, name: "Baby Onesie" },
  { id: "li_2", item_type: "gift_cards", quantity: 1, name: "Gift Card" },
]

const mockUpdateLineItem = vi.fn().mockResolvedValue({ id: "li_1" })
const mockDeleteLineItem = vi.fn().mockResolvedValue(undefined)
const mockReload = vi.fn().mockResolvedValue(undefined)
const mockMutate = vi.fn()

const mockUseLineItems = vi.fn()

vi.mock("@commercelayer/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/hooks")>()
  return {
    ...actual,
    useLineItems: (...args: unknown[]) => mockUseLineItems(...args),
  }
})

function defaultHookReturn(overrides = {}) {
  return {
    lineItems: MOCK_LINE_ITEMS,
    isLoading: false,
    isValidating: false,
    error: null,
    updateLineItem: mockUpdateLineItem,
    deleteLineItem: mockDeleteLineItem,
    reload: mockReload,
    mutate: mockMutate,
    ...overrides,
  }
}

describe("LineItems component", () => {
  beforeEach(() => {
    mockUseLineItems.mockReturnValue(defaultHookReturn())
    mockUpdateLineItem.mockClear()
    mockDeleteLineItem.mockClear()
    mockReload.mockClear()
  })

  it("renders children when not loading", () => {
    render(
      <LineItems accessToken="token" orderId="order-1">
        <span data-testid="child">content</span>
      </LineItems>
    )

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("renders multiple children", () => {
    render(
      <LineItems accessToken="token" orderId="order-1">
        <span data-testid="child-1">one</span>
        <span data-testid="child-2">two</span>
      </LineItems>
    )

    expect(screen.getByTestId("child-1")).toBeDefined()
    expect(screen.getByTestId("child-2")).toBeDefined()
  })

  it("renders the loader while isLoading is true", () => {
    mockUseLineItems.mockReturnValue(defaultHookReturn({ isLoading: true }))

    render(
      <LineItems
        accessToken="token"
        orderId="order-1"
        loader={<span data-testid="loader">Loading…</span>}
      >
        <span data-testid="child">content</span>
      </LineItems>
    )

    expect(screen.getByTestId("loader")).toBeDefined()
    expect(screen.queryByTestId("child")).toBeNull()
  })

  it("hides the loader and shows children when isLoading becomes false", () => {
    mockUseLineItems.mockReturnValue(defaultHookReturn({ isLoading: false }))

    render(
      <LineItems
        accessToken="token"
        orderId="order-1"
        loader={<span data-testid="loader">Loading…</span>}
      >
        <span data-testid="child">content</span>
      </LineItems>
    )

    expect(screen.queryByTestId("loader")).toBeNull()
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("provides lineItems via LineItemContext to children", () => {
    let capturedLineItems: unknown = null

    function Consumer() {
      const { lineItems } = useContext(LineItemContext)
      capturedLineItems = lineItems
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1">
        <Consumer />
      </LineItems>
    )

    expect(capturedLineItems).toEqual(MOCK_LINE_ITEMS)
  })

  it("filters lineItems by types prop before passing to context", () => {
    let capturedLineItems: unknown = null

    function Consumer() {
      const { lineItems } = useContext(LineItemContext)
      capturedLineItems = lineItems
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1" types={["skus"]}>
        <Consumer />
      </LineItems>
    )

    expect(capturedLineItems).toEqual([MOCK_LINE_ITEMS[0]])
  })

  it("provides all lineItems when types prop is not set", () => {
    let capturedLineItems: unknown = null

    function Consumer() {
      const { lineItems } = useContext(LineItemContext)
      capturedLineItems = lineItems
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1">
        <Consumer />
      </LineItems>
    )

    expect(capturedLineItems).toEqual(MOCK_LINE_ITEMS)
  })

  it("passes accessToken and orderId to useLineItems", () => {
    render(
      <LineItems accessToken="my-token" orderId="my-order">
        <span />
      </LineItems>
    )

    expect(mockUseLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "my-token", orderId: "my-order" })
    )
  })

  it("reads orderId from OrderContext when prop is not provided", () => {
    const orderCtxValue = { ...defaultOrderContext, orderId: "ctx-order-id" }

    render(
      <OrderContext.Provider value={orderCtxValue}>
        <LineItems accessToken="my-token">
          <span />
        </LineItems>
      </OrderContext.Provider>
    )

    expect(mockUseLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "my-token", orderId: "ctx-order-id" })
    )
  })

  it("prop orderId takes precedence over OrderContext orderId", () => {
    const orderCtxValue = { ...defaultOrderContext, orderId: "ctx-order-id" }

    render(
      <OrderContext.Provider value={orderCtxValue}>
        <LineItems accessToken="my-token" orderId="prop-order-id">
          <span />
        </LineItems>
      </OrderContext.Provider>
    )

    expect(mockUseLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "my-token", orderId: "prop-order-id" })
    )
  })

  it("reads accessToken from CommerceLayerContext when prop is not provided", () => {
    render(
      <CommerceLayerContext.Provider value={{ accessToken: "ctx-token" }}>
        <LineItems orderId="order-1">
          <span />
        </LineItems>
      </CommerceLayerContext.Provider>
    )

    expect(mockUseLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "ctx-token", orderId: "order-1" })
    )
  })

  it("prop accessToken takes precedence over CommerceLayerContext accessToken", () => {
    render(
      <CommerceLayerContext.Provider value={{ accessToken: "ctx-token" }}>
        <LineItems accessToken="prop-token" orderId="order-1">
          <span />
        </LineItems>
      </CommerceLayerContext.Provider>
    )

    expect(mockUseLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "prop-token", orderId: "order-1" })
    )
  })

  it("calls onUpdate callback after a successful updateLineItem", async () => {
    const onUpdate = vi.fn()
    let contextUpdateLineItem: ((id: string, qty?: number) => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextUpdateLineItem = ctx.updateLineItem
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1" onUpdate={onUpdate}>
        <Consumer />
      </LineItems>
    )

    await act(async () => {
      await contextUpdateLineItem?.("li_1", 2)
    })

    expect(mockUpdateLineItem).toHaveBeenCalledWith("li_1", 2, undefined)
    expect(onUpdate).toHaveBeenCalledWith("li_1")
  })

  it("calls onDelete callback after a successful deleteLineItem", async () => {
    const onDelete = vi.fn()
    let contextDeleteLineItem: ((id: string) => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextDeleteLineItem = ctx.deleteLineItem
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1" onDelete={onDelete}>
        <Consumer />
      </LineItems>
    )

    await act(async () => {
      await contextDeleteLineItem?.("li_1")
    })

    expect(mockDeleteLineItem).toHaveBeenCalledWith("li_1")
    expect(onDelete).toHaveBeenCalledWith("li_1")
  })

  it("exposes reload function via context", async () => {
    let contextReload: (() => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextReload = ctx.reload
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1">
        <Consumer />
      </LineItems>
    )

    expect(contextReload).toBeDefined()

    await act(async () => {
      await contextReload?.()
    })

    expect(mockReload).toHaveBeenCalledOnce()
  })

  it("exposes error in context when hook returns an error", () => {
    mockUseLineItems.mockReturnValue(defaultHookReturn({ error: "Something went wrong" }))

    let capturedErrors: unknown = null

    function Consumer() {
      const { errors } = useContext(LineItemContext)
      capturedErrors = errors
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1">
        <Consumer />
      </LineItems>
    )

    expect(capturedErrors).toEqual([
      expect.objectContaining({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      }),
    ])
  })

  it("exposes empty errors array when there is no error", () => {
    let capturedErrors: unknown = null

    function Consumer() {
      const { errors } = useContext(LineItemContext)
      capturedErrors = errors
      return null
    }

    render(
      <LineItems accessToken="token" orderId="order-1">
        <Consumer />
      </LineItems>
    )

    expect(capturedErrors).toEqual([])
  })
})
