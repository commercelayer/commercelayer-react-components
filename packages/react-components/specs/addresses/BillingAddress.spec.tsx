import { act, render, screen, waitFor } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { BillingAddress } from "#components/addresses/BillingAddress"
import AddressContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressContext from "#context/BillingAddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const core = vi.hoisted(() => ({
  updateAddressReference: vi.fn(),
}))

vi.mock("@commercelayer/core-components", () => ({
  updateAddressReference: core.updateAddressReference,
}))

type BillingAddressCtx = {
  setBillingAddress?: (id: string, options?: { customerAddressId: string }) => Promise<void>
  _billing_address_clone_id?: string
  billingCustomerAddressId?: string
}

let latestContext: BillingAddressCtx | undefined

function ContextProbe(): null {
  latestContext = useContext(BillingAddressContext)
  return null
}

interface RenderBillingAddressOptions {
  orderOverrides?: Record<string, unknown>
  addressOverrides?: Record<string, unknown>
  commerceLayer?: Record<string, unknown>
  include?: string[]
  children?: ReactNode
}

function buildBillingAddressTree({
  orderOverrides = {},
  addressOverrides = {},
  commerceLayer = { accessToken: "test-token" },
  include,
  children = <ContextProbe />,
  addResourceToInclude = vi.fn(),
  setCloneAddress = vi.fn(),
}: RenderBillingAddressOptions & {
  addResourceToInclude?: ReturnType<typeof vi.fn>
  setCloneAddress?: ReturnType<typeof vi.fn>
}) {
  const commerceLayerValue = commerceLayer as any
  const orderContextValue = {
    ...defaultOrderContext,
    addResourceToInclude,
    include,
    ...orderOverrides,
  } as any
  const addressContextValue = {
    ...defaultAddressContext,
    setCloneAddress,
    ...addressOverrides,
  } as any

  return (
    <CommerceLayerContext.Provider value={commerceLayerValue}>
      <OrderContext.Provider value={orderContextValue}>
        <AddressContext.Provider value={addressContextValue}>
          <BillingAddress>{children}</BillingAddress>
        </AddressContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderBillingAddress(options: RenderBillingAddressOptions = {}) {
  latestContext = undefined
  const addResourceToInclude = vi.fn()
  const setCloneAddress = vi.fn()
  const result = render(
    buildBillingAddressTree({
      ...options,
      addResourceToInclude,
      setCloneAddress,
    })
  )

  return {
    ...result,
    addResourceToInclude,
    setCloneAddress,
    getContext: () => {
      if (!latestContext) {
        throw new Error("BillingAddress context not captured")
      }
      return latestContext
    },
    rerenderBillingAddress: (nextOptions: RenderBillingAddressOptions = {}) =>
      result.rerender(
        buildBillingAddressTree({
          ...options,
          ...nextOptions,
          orderOverrides: {
            ...(options.orderOverrides ?? {}),
            ...(nextOptions.orderOverrides ?? {}),
          },
          addressOverrides: {
            ...(options.addressOverrides ?? {}),
            ...(nextOptions.addressOverrides ?? {}),
          },
          commerceLayer: nextOptions.commerceLayer ?? options.commerceLayer,
          include: nextOptions.include ?? options.include,
          children: nextOptions.children ?? options.children,
          addResourceToInclude,
          setCloneAddress,
        })
      ),
  }
}

beforeEach(() => {
  latestContext = undefined
  vi.clearAllMocks()
})

describe("BillingAddress", () => {
  it("renders children", () => {
    renderBillingAddress({
      children: (
        <>
          <span>Billing child</span>
          <ContextProbe />
        </>
      ),
    })

    expect(screen.getByText("Billing child")).toBeTruthy()
  })

  it("calls addResourceToInclude when billing_address not in include", async () => {
    const { addResourceToInclude } = renderBillingAddress({ include: [] })

    await waitFor(() => {
      expect(addResourceToInclude).toHaveBeenCalledWith({
        newResource: "billing_address",
        resourcesIncluded: [],
      })
    })
  })

  it("does not call addResourceToInclude when billing_address already included", () => {
    const { addResourceToInclude } = renderBillingAddress({ include: ["billing_address"] })

    expect(addResourceToInclude).not.toHaveBeenCalled()
  })

  it("reads billing_address reference from order on mount", async () => {
    const { getContext, setCloneAddress } = renderBillingAddress({
      include: ["billing_address"],
      orderOverrides: {
        order: { id: "order-1", billing_address: { reference: "cust-addr-1" } },
      },
    })

    await waitFor(() => {
      expect(getContext().billingCustomerAddressId).toBe("cust-addr-1")
    })
    expect(setCloneAddress).toHaveBeenCalledWith("cust-addr-1", "billing_address")
  })

  it("does not set billingCustomerAddressId when order has no billing_address reference", () => {
    const { getContext, setCloneAddress } = renderBillingAddress({
      include: ["billing_address"],
      orderOverrides: {
        order: { id: "order-1", billing_address: {} },
      },
    })

    expect(getContext().billingCustomerAddressId).toBeUndefined()
    expect(setCloneAddress).not.toHaveBeenCalled()
  })

  it("provides BillingAddressContext to children with initial state", () => {
    const { getContext } = renderBillingAddress({ include: ["billing_address"] })

    expect(getContext()._billing_address_clone_id).toBe("")
    expect(getContext().billingCustomerAddressId).toBeUndefined()
    expect(getContext().setBillingAddress).toBeTypeOf("function")
  })

  it("setBillingAddress with order: sets cloneId and calls setCloneAddress", async () => {
    const { getContext, setCloneAddress } = renderBillingAddress({
      include: ["billing_address"],
      orderOverrides: {
        order: { id: "order-1" },
      },
    })
    const setBillingAddress = getContext().setBillingAddress

    expect(setBillingAddress).toBeTypeOf("function")

    await act(async () => {
      await setBillingAddress?.("addr-1")
    })

    await waitFor(() => {
      expect(getContext()._billing_address_clone_id).toBe("addr-1")
    })
    expect(setCloneAddress).toHaveBeenCalledWith("addr-1", "billing_address")
  })

  it("setBillingAddress with customerAddressId: calls updateAddressReference", async () => {
    const interceptors = { request: { use: vi.fn() } }
    core.updateAddressReference.mockResolvedValue(undefined)
    const { getContext } = renderBillingAddress({
      include: ["billing_address"],
      commerceLayer: { accessToken: "test-token", interceptors },
      orderOverrides: {
        order: { id: "order-1" },
      },
    })
    const setBillingAddress = getContext().setBillingAddress

    await act(async () => {
      await setBillingAddress?.("addr-1", { customerAddressId: "cust-1" })
    })

    expect(core.updateAddressReference).toHaveBeenCalledWith({
      id: "addr-1",
      reference: "cust-1",
      accessToken: "test-token",
      interceptors,
    })
    expect(getContext()._billing_address_clone_id).toBe("addr-1")
  })

  it("setBillingAddress without order: does NOT set cloneId", async () => {
    const { getContext, setCloneAddress } = renderBillingAddress({ include: ["billing_address"] })
    const setBillingAddress = getContext().setBillingAddress

    await act(async () => {
      await setBillingAddress?.("addr-1")
    })

    expect(getContext()._billing_address_clone_id).toBe("")
    expect(setCloneAddress).toHaveBeenCalledWith("addr-1", "billing_address")
  })

  it("setBillingAddress error: logs error", async () => {
    const error = new Error("update failed")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    core.updateAddressReference.mockRejectedValue(error)
    const { getContext, setCloneAddress } = renderBillingAddress({
      include: ["billing_address"],
      orderOverrides: {
        order: { id: "order-1" },
      },
    })
    const setBillingAddress = getContext().setBillingAddress

    await act(async () => {
      await setBillingAddress?.("addr-1", { customerAddressId: "cust-1" })
    })

    expect(consoleError).toHaveBeenCalledWith("Set billing address", error)
    expect(setCloneAddress).not.toHaveBeenCalledWith("addr-1", "billing_address")
    consoleError.mockRestore()
  })

  it("setBillingAddress without accessToken: skips updateAddressReference", async () => {
    const { getContext } = renderBillingAddress({
      include: ["billing_address"],
      commerceLayer: {},
      orderOverrides: {
        order: { id: "order-1" },
      },
    })
    const setBillingAddress = getContext().setBillingAddress

    await act(async () => {
      await setBillingAddress?.("addr-1", { customerAddressId: "cust-1" })
    })

    expect(core.updateAddressReference).not.toHaveBeenCalled()
    expect(getContext()._billing_address_clone_id).toBe("addr-1")
  })

  it("cleanup on unmount: resets state", async () => {
    const { getContext, rerenderBillingAddress, unmount } = renderBillingAddress({
      include: ["billing_address"],
      orderOverrides: {
        order: { id: "order-1", billing_address: { reference: "cust-addr-1" } },
      },
    })

    await waitFor(() => {
      expect(getContext().billingCustomerAddressId).toBe("cust-addr-1")
    })

    const setBillingAddress = getContext().setBillingAddress

    await act(async () => {
      await setBillingAddress?.("addr-1")
    })

    await waitFor(() => {
      expect(getContext()._billing_address_clone_id).toBe("addr-1")
    })

    rerenderBillingAddress({
      orderOverrides: {
        order: undefined,
      },
    })

    await waitFor(() => {
      expect(getContext()._billing_address_clone_id).toBe("")
      expect(getContext().billingCustomerAddressId).toBeUndefined()
    })

    unmount()
  })
})
