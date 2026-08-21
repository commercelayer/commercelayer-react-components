import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
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

vi.mock("@commercelayer/react-hooks-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/react-hooks-components")>()
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

function Providers({
  accessToken = "token",
  orderId = "order-1",
  children,
}: {
  accessToken?: string
  orderId?: string
  children: ReactNode
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken }}>
      <OrderContext.Provider value={{ ...defaultOrderContext, orderId }}>
        {children}
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
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
      <Providers>
        <LineItems>
          <span data-testid="child">content</span>
        </LineItems>
      </Providers>
    )

    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("renders multiple children", () => {
    render(
      <Providers>
        <LineItems>
          <span data-testid="child-1">one</span>
          <span data-testid="child-2">two</span>
        </LineItems>
      </Providers>
    )

    expect(screen.getByTestId("child-1")).toBeDefined()
    expect(screen.getByTestId("child-2")).toBeDefined()
  })

  it("renders the loader while isLoading is true", () => {
    mockUseLineItems.mockReturnValue(defaultHookReturn({ isLoading: true }))

    render(
      <Providers>
        <LineItems loader={<span data-testid="loader">Loading…</span>}>
          <span data-testid="child">content</span>
        </LineItems>
      </Providers>
    )

    expect(screen.getByTestId("loader")).toBeDefined()
    expect(screen.queryByTestId("child")).toBeNull()
  })

  it("hides the loader and shows children when isLoading becomes false", () => {
    mockUseLineItems.mockReturnValue(defaultHookReturn({ isLoading: false }))

    render(
      <Providers>
        <LineItems loader={<span data-testid="loader">Loading…</span>}>
          <span data-testid="child">content</span>
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems types={["skus"]}>
          <Consumer />
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
    )

    expect(capturedLineItems).toEqual(MOCK_LINE_ITEMS)
  })

  it("reads accessToken and orderId from context and passes them to useLineItems", () => {
    render(
      <Providers accessToken="ctx-token" orderId="ctx-order">
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockUseLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "ctx-token", orderId: "ctx-order" })
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
      <Providers>
        <LineItems onUpdate={onUpdate}>
          <Consumer />
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems onDelete={onDelete}>
          <Consumer />
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
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
      <Providers>
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
    )

    expect(capturedErrors).toEqual([])
  })
})
