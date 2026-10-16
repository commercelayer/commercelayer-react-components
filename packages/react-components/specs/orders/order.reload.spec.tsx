import { act, render, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"

const FIRST = { id: "li_1", item_type: "skus", updated_at: "2026-10-16T10:00:00.000Z" }
const ADDED = { id: "li_2", item_type: "skus", updated_at: "2026-10-16T10:05:00.000Z" }

// What the API holds; the test changes it to play an external update.
let server = { subtotal: 100, lineItems: [FIRST] }

const retrieve = vi.fn(async (id: string) => ({
  id,
  editable: true,
  subtotal_amount_cents: server.subtotal,
  line_items: server.lineItems,
}))
const getLineItems = vi.fn(async () => server.lineItems)

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({ orders: { retrieve } }),
    getLineItems: () => getLineItems(),
  }
})

const { Order } = await import("#components/orders/Order")
const { LineItems } = await import("#components/line_items/LineItems")
const { default: CommerceLayerContext } = await import("#context/CommerceLayerContext")
const { default: LineItemContext } = await import("#context/LineItemContext")
const { default: OrderContext } = await import("#context/OrderContext")
const { useOrderContainer } = await import("#hooks/useOrderContainer")

describe("useOrderContainer().reloadOrder()", () => {
  let renders: string[]
  let reloadOrder: (() => Promise<unknown>) | undefined

  // Records what the cart shows on every render: the subtotal from the order
  // and the number of rows from the line items.
  function Cart(): null {
    const { order } = useContext(OrderContext)
    const { lineItems } = useContext(LineItemContext)
    reloadOrder = useOrderContainer().reloadOrder
    renders.push(`${order?.subtotal_amount_cents}/${lineItems?.length}`)
    return null
  }

  beforeEach(() => {
    server = { subtotal: 100, lineItems: [FIRST] }
    renders = []
    reloadOrder = undefined
    retrieve.mockClear()
    getLineItems.mockClear()
  })

  async function renderCart(): Promise<void> {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <CommerceLayerContext.Provider value={{ accessToken: "token" }}>
          <Order orderId="order-1">
            <LineItems>
              <Cart />
            </LineItems>
          </Order>
        </CommerceLayerContext.Provider>
      </SWRConfig>
    )
    await waitFor(() => expect(renders.at(-1)).toBe("100/1"))
  }

  it("updates the order and its line items together after an external change", async () => {
    await renderCart()
    const lineItemsRequestsBefore = getLineItems.mock.calls.length

    server = { subtotal: 200, lineItems: [FIRST, ADDED] }
    // the line items answer after the order, the case that showed the
    // totals before the rows
    getLineItems.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(server.lineItems), 50))
    )
    renders = []
    await act(async () => {
      await reloadOrder?.()
    })

    expect(renders.at(-1)).toBe("200/2")
    expect(renders).not.toContain("200/1")
    expect(getLineItems.mock.calls.length - lineItemsRequestsBefore).toBe(1)
  })
})
