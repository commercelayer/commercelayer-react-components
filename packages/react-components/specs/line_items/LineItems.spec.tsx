import type { Order } from "@commercelayer/sdk"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LineItem } from "#components/line_items/LineItem"
import { LineItemQuantity } from "#components/line_items/LineItemQuantity"
import { LineItems } from "#components/line_items/LineItems"
import CommerceLayerContext from "#context/CommerceLayerContext"
import LineItemContext from "#context/LineItemContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const MOCK_LINE_ITEMS = [
  {
    id: "li_1",
    item_type: "skus",
    quantity: 2,
    name: "Baby Onesie",
    sku_code: "BABYONBU",
    updated_at: "2026-10-16T10:00:00.000Z",
  },
  {
    id: "li_2",
    item_type: "gift_cards",
    quantity: 1,
    name: "Gift Card",
    updated_at: "2026-10-16T10:00:00.000Z",
  },
]

const mockUpdateLineItem = vi.fn().mockResolvedValue({ id: "li_1" })
const mockDeleteLineItem = vi.fn().mockResolvedValue(undefined)
const mockReload = vi.fn().mockResolvedValue(undefined)
const mockMutate = vi.fn()

const mockGetOrder = vi.fn().mockResolvedValue(undefined)

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
  order,
  children,
}: {
  accessToken?: string
  orderId?: string
  order?: Order
  children: ReactNode
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken }}>
      <OrderContext.Provider
        value={{ ...defaultOrderContext, orderId, order, getOrder: mockGetOrder }}
      >
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
    mockGetOrder.mockClear()
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

  // The hook owns the line items, but the amounts shown by `<SubTotalAmount>`
  // and `<TotalAmount>` come from the order in `OrderContext`, which only a
  // refetch updates. See issue #867.
  it("refreshes the order after a line item is updated", async () => {
    let contextUpdateLineItem: ((id: string, qty?: number) => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextUpdateLineItem = ctx.updateLineItem
      return null
    }

    render(
      <Providers orderId="order-42">
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
    )

    await act(async () => {
      await contextUpdateLineItem?.("li_1", 2)
    })

    expect(mockGetOrder).toHaveBeenCalledWith("order-42")
  })

  it("refreshes the order after a line item is deleted", async () => {
    let contextDeleteLineItem: ((id: string) => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextDeleteLineItem = ctx.deleteLineItem
      return null
    }

    render(
      <Providers orderId="order-42">
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
    )

    await act(async () => {
      await contextDeleteLineItem?.("li_1")
    })

    expect(mockGetOrder).toHaveBeenCalledWith("order-42")
  })

  it("refreshes the order only after the line item update has gone through", async () => {
    const calls: string[] = []
    mockUpdateLineItem.mockImplementationOnce(async () => {
      calls.push("update")
      return { id: "li_1" }
    })
    mockGetOrder.mockImplementationOnce(async () => {
      calls.push("getOrder")
      return undefined
    })

    let contextUpdateLineItem: ((id: string, qty?: number) => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextUpdateLineItem = ctx.updateLineItem
      return null
    }

    render(
      <Providers>
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
    )

    await act(async () => {
      await contextUpdateLineItem?.("li_1", 3)
    })

    expect(calls).toEqual(["update", "getOrder"])
  })

  it("does not refresh the order when no order id is known", async () => {
    let contextUpdateLineItem: ((id: string, qty?: number) => Promise<void>) | undefined

    function Consumer() {
      const ctx = useContext(LineItemContext)
      contextUpdateLineItem = ctx.updateLineItem
      return null
    }

    render(
      <Providers orderId="">
        <LineItems>
          <Consumer />
        </LineItems>
      </Providers>
    )

    await act(async () => {
      await contextUpdateLineItem?.("li_1", 2)
    })

    expect(mockUpdateLineItem).toHaveBeenCalled()
    expect(mockGetOrder).not.toHaveBeenCalled()
  })

  it("refreshes the order when the quantity is changed through <LineItemQuantity>", async () => {
    render(
      <Providers orderId="order-42">
        <LineItems>
          <LineItem>
            <LineItemQuantity />
          </LineItem>
        </LineItems>
      </Providers>
    )

    fireEvent.change(screen.getByTestId("BABYONBU"), { target: { value: "2" } })

    await waitFor(() => {
      expect(mockUpdateLineItem).toHaveBeenCalledWith("li_1", 2, undefined)
      expect(mockGetOrder).toHaveBeenCalledWith("order-42")
    })
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

// When the order is updated externally and refetched, the line items cache has
// to follow, or the totals move while the list stays behind. See issue #874.
describe("LineItems component when the order is refetched", () => {
  function orderWith(lineItems: Array<Record<string, unknown>> | undefined, id = "order-1") {
    return { id, line_items: lineItems } as unknown as Order
  }

  beforeEach(() => {
    mockUseLineItems.mockReturnValue(defaultHookReturn())
    mockReload.mockClear()
  })

  it("does not reload the line items when the order brings the same ones", () => {
    const { rerender } = render(
      <Providers order={orderWith(MOCK_LINE_ITEMS)}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )
    rerender(
      <Providers order={orderWith([...MOCK_LINE_ITEMS].reverse())}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).not.toHaveBeenCalled()
  })

  it("reloads the line items when the order brings one more", () => {
    const { rerender } = render(
      <Providers order={orderWith(MOCK_LINE_ITEMS)}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )
    rerender(
      <Providers
        order={orderWith([
          ...MOCK_LINE_ITEMS,
          { id: "li_3", item_type: "skus", updated_at: "2026-10-16T10:05:00.000Z" },
        ])}
      >
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).toHaveBeenCalledOnce()
  })

  it("reloads the line items when the order brings one less", () => {
    render(
      <Providers order={orderWith([MOCK_LINE_ITEMS[0]])}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).toHaveBeenCalledOnce()
  })

  it("reloads the line items when one of them has changed", () => {
    render(
      <Providers
        order={orderWith([
          { ...MOCK_LINE_ITEMS[0], quantity: 3, updated_at: "2026-10-16T10:05:00.000Z" },
          MOCK_LINE_ITEMS[1],
        ])}
      >
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).toHaveBeenCalledOnce()
  })

  it("does not reload the line items while their first fetch is in flight", () => {
    mockUseLineItems.mockReturnValue(defaultHookReturn({ lineItems: [], isLoading: true }))

    render(
      <Providers order={orderWith(MOCK_LINE_ITEMS)}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).not.toHaveBeenCalled()
  })

  it("does not reload the line items when the order came without them", () => {
    render(
      <Providers order={orderWith(undefined)}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).not.toHaveBeenCalled()
  })

  it("ignores an order other than the one the line items belong to", () => {
    render(
      <Providers orderId="order-1" order={orderWith([MOCK_LINE_ITEMS[0]], "order-2")}>
        <LineItems>
          <span />
        </LineItems>
      </Providers>
    )

    expect(mockReload).not.toHaveBeenCalled()
  })
})
