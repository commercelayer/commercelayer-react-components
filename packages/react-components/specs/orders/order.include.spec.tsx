import { render, waitFor } from "@testing-library/react"
import { useContext, useEffect } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const retrieve = vi.fn().mockResolvedValue({ id: "order-1", editable: true })

vi.mock("@commercelayer/core-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/core-components")>()
  return {
    ...actual,
    getSdk: vi.fn().mockReturnValue({ orders: { retrieve } }),
  }
})

const { Order } = await import("#components/orders/Order")
const { default: CommerceLayerContext } = await import("#context/CommerceLayerContext")
const { default: OrderContext } = await import("#context/OrderContext")
const { default: OrderStorageContext } = await import("#context/OrderStorageContext")

const storageCtxValue = {
  persistKey: undefined,
  clearWhenPlaced: false,
  getLocalOrder: vi.fn(),
  setLocalOrder: vi.fn(),
  deleteLocalOrder: vi.fn(),
}

function Wrapper({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: "token" }}>
      <OrderStorageContext.Provider value={storageCtxValue}>
        {children}
      </OrderStorageContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

/**
 * Stands in for a component that registers its own includes when it mounts —
 * `<PlaceOrder>` and `<Shipments>` both do this, with lists that do not mention
 * `line_items`.
 */
function ChildRegisteringIncludes({ resources }: { resources: string[] }): null {
  const { addResourceToInclude, include } = useContext(OrderContext)
  useEffect(() => {
    const missing = resources.filter((resource) => !include?.includes(resource))
    if (missing.length > 0) {
      // biome-ignore lint/suspicious/noExplicitAny: the context type narrows to the known resource union
      addResourceToInclude({ newResource: missing as any, resourcesIncluded: include as any })
    }
  }, [resources, include, addResourceToInclude])
  return null
}

function includesOf(call: unknown[]): string[] {
  return ((call[1] as { include?: string[] })?.include ?? []) as string[]
}

describe("<Order include>", () => {
  beforeEach(() => {
    retrieve.mockClear()
  })

  it("carries the declared resources on the first request", async () => {
    render(
      <Wrapper>
        <Order orderId="order-1" include={["line_items"]}>
          <span />
        </Order>
      </Wrapper>
    )

    await waitFor(() => {
      expect(retrieve).toHaveBeenCalled()
    })
    expect(includesOf(retrieve.mock.calls[0])).toContain("line_items")
  })

  it("keeps them on every request once another component registers its own", async () => {
    const placeOrderResources = [
      "shipments.available_shipping_methods",
      "shipments.shipping_method",
      "billing_address",
      "shipping_address",
    ]

    render(
      <Wrapper>
        <Order orderId="order-1" include={["line_items"]}>
          <ChildRegisteringIncludes resources={placeOrderResources} />
        </Order>
      </Wrapper>
    )

    await waitFor(() => {
      expect(retrieve).toHaveBeenCalled()
    })

    // The regression this guards: an order fetched with the shipping step's
    // include list and no `line_items` is indistinguishable, to the caller, from
    // an order with an empty cart.
    await waitFor(() => {
      expect(includesOf(retrieve.mock.calls.at(-1) ?? [])).toContain("shipments.shipping_method")
    })
    for (const call of retrieve.mock.calls) {
      expect(includesOf(call)).toContain("line_items")
    }
  })

  it("fetches without includes when the caller declares none", async () => {
    render(
      <Wrapper>
        <Order orderId="order-1">
          <span />
        </Order>
      </Wrapper>
    )

    await waitFor(() => {
      expect(retrieve).toHaveBeenCalled()
    })
    expect(includesOf(retrieve.mock.calls[0])).toEqual([])
  })
})
