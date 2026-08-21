import { act, render, screen, waitFor } from "@testing-library/react"
import { type JSX, type ReactNode, useContext } from "react"
import ShippingAddress from "#components/addresses/ShippingAddress"
import AddressContext, { defaultAddressContext } from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShippingAddressContext from "#context/ShippingAddressContext"

const core = vi.hoisted(() => ({
  updateAddressReference: vi.fn(),
}))

vi.mock("@commercelayer/core-components", () => ({
  updateAddressReference: core.updateAddressReference,
}))

type ShippingAddressContextValue = {
  _shipping_address_clone_id?: string
  shippingCustomerAddressId?: string
  setShippingAddress?: (id: string, options?: { customerAddressId: string }) => Promise<void>
}

let latestContext: ShippingAddressContextValue | undefined

function ContextProbe(): JSX.Element {
  latestContext = useContext(ShippingAddressContext)

  return (
    <>
      <div data-testid="clone-id">{latestContext._shipping_address_clone_id ?? ""}</div>
      <div data-testid="customer-address-id">{latestContext.shippingCustomerAddressId ?? ""}</div>
    </>
  )
}

interface BuildTreeOptions {
  children?: ReactNode
  orderContextOverrides?: Record<string, unknown>
  addressContextOverrides?: Record<string, unknown>
  commerceLayerValue?: Record<string, unknown>
  setCloneAddress?: ReturnType<typeof vi.fn>
}

function buildTree({
  children,
  orderContextOverrides = {},
  addressContextOverrides = {},
  commerceLayerValue = { accessToken: "token" },
  setCloneAddress = vi.fn(),
}: BuildTreeOptions): JSX.Element {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider value={commerceLayerValue as any}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            ...orderContextOverrides,
            // biome-ignore lint/suspicious/noExplicitAny: test provider cast
          } as any
        }
      >
        <AddressContext.Provider
          value={
            {
              ...defaultAddressContext,
              ...addressContextOverrides,
              setCloneAddress,
              // biome-ignore lint/suspicious/noExplicitAny: test provider cast
            } as any
          }
        >
          <ShippingAddress>
            {children}
            <ContextProbe />
          </ShippingAddress>
        </AddressContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

function renderShippingAddress(options: BuildTreeOptions = {}) {
  latestContext = undefined
  const setCloneAddress = options.setCloneAddress ?? vi.fn()
  const utils = render(
    buildTree({
      children: options.children ?? <span data-testid="child">child</span>,
      orderContextOverrides: options.orderContextOverrides,
      addressContextOverrides: options.addressContextOverrides,
      commerceLayerValue: options.commerceLayerValue,
      setCloneAddress,
    })
  )

  return {
    ...utils,
    setCloneAddress,
    getContext: () => latestContext as ShippingAddressContextValue,
  }
}

beforeEach(() => {
  latestContext = undefined
  core.updateAddressReference.mockReset()
  core.updateAddressReference.mockResolvedValue(undefined)
})

describe("ShippingAddress", () => {
  it("renders children", () => {
    renderShippingAddress({ children: <span data-testid="child">hello</span> })

    expect(screen.getByTestId("child").textContent).toBe("hello")
  })

  it("reads shipping_address reference from order on mount", async () => {
    const { getContext, setCloneAddress } = renderShippingAddress({
      orderContextOverrides: {
        order: {
          shipping_address: {
            reference: "cust-addr-2",
          },
        },
      },
    })

    await waitFor(() => {
      expect(getContext().shippingCustomerAddressId).toBe("cust-addr-2")
    })

    expect(setCloneAddress).toHaveBeenCalledWith("cust-addr-2", "shipping_address")
  })

  it("does not set shippingCustomerAddressId when order has no shipping_address reference", () => {
    const { getContext, setCloneAddress } = renderShippingAddress({
      orderContextOverrides: {
        order: {
          shipping_address: {
            id: "addr-1",
          },
        },
      },
    })

    expect(getContext().shippingCustomerAddressId).toBeUndefined()
    expect(setCloneAddress).not.toHaveBeenCalled()
  })

  it("provides ShippingAddressContext with initial state", () => {
    const { getContext } = renderShippingAddress()

    expect(getContext()).toEqual(
      expect.objectContaining({
        _shipping_address_clone_id: "",
        shippingCustomerAddressId: undefined,
        setShippingAddress: expect.any(Function),
      })
    )
  })

  it("setShippingAddress with order: sets cloneId and calls setCloneAddress", async () => {
    const { getContext, setCloneAddress } = renderShippingAddress({
      orderContextOverrides: {
        order: { id: "ord-1" },
      },
    })

    await act(async () => {
      await getContext().setShippingAddress?.("addr-2")
    })

    await waitFor(() => {
      expect(getContext()._shipping_address_clone_id).toBe("addr-2")
    })

    expect(setCloneAddress).toHaveBeenCalledWith("addr-2", "shipping_address")
    expect(core.updateAddressReference).not.toHaveBeenCalled()
  })

  it("setShippingAddress with customerAddressId: calls updateAddressReference", async () => {
    const interceptors = { trace: true }
    const { getContext, setCloneAddress } = renderShippingAddress({
      commerceLayerValue: {
        accessToken: "token",
        interceptors,
      },
      orderContextOverrides: {
        order: { id: "ord-1" },
      },
    })

    await act(async () => {
      await getContext().setShippingAddress?.("addr-2", { customerAddressId: "cust-addr-2" })
    })

    expect(core.updateAddressReference).toHaveBeenCalledWith({
      id: "addr-2",
      reference: "cust-addr-2",
      accessToken: "token",
      interceptors,
    })

    await waitFor(() => {
      expect(getContext()._shipping_address_clone_id).toBe("addr-2")
    })

    expect(setCloneAddress).toHaveBeenCalledWith("addr-2", "shipping_address")
  })

  it("setShippingAddress without order: does NOT set cloneId", async () => {
    const { getContext, setCloneAddress } = renderShippingAddress()

    await act(async () => {
      await getContext().setShippingAddress?.("addr-2")
    })

    expect(getContext()._shipping_address_clone_id).toBe("")
    expect(setCloneAddress).toHaveBeenCalledWith("addr-2", "shipping_address")
    expect(core.updateAddressReference).not.toHaveBeenCalled()
  })

  it("setShippingAddress error: logs error", async () => {
    const error = new Error("boom")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    core.updateAddressReference.mockRejectedValueOnce(error)

    const { getContext, setCloneAddress } = renderShippingAddress({
      orderContextOverrides: {
        order: { id: "ord-1" },
      },
    })

    await act(async () => {
      await getContext().setShippingAddress?.("addr-2", { customerAddressId: "cust-addr-2" })
    })

    expect(consoleError).toHaveBeenCalledWith("Set shipping address", error)
    expect(getContext()._shipping_address_clone_id).toBe("")
    expect(setCloneAddress).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("setShippingAddress without accessToken: skips updateAddressReference", async () => {
    const { getContext, setCloneAddress } = renderShippingAddress({
      commerceLayerValue: {},
      orderContextOverrides: {
        order: { id: "ord-1" },
      },
    })

    await act(async () => {
      await getContext().setShippingAddress?.("addr-2", { customerAddressId: "cust-addr-2" })
    })

    expect(core.updateAddressReference).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(getContext()._shipping_address_clone_id).toBe("addr-2")
    })

    expect(setCloneAddress).toHaveBeenCalledWith("addr-2", "shipping_address")
  })

  it("cleanup resets state when the order changes before unmount", async () => {
    const setCloneAddress = vi.fn()
    const { getContext, rerender, unmount } = renderShippingAddress({
      setCloneAddress,
      orderContextOverrides: {
        order: { id: "ord-1" },
      },
    })

    await act(async () => {
      await getContext().setShippingAddress?.("addr-2")
    })

    await waitFor(() => {
      expect(getContext()._shipping_address_clone_id).toBe("addr-2")
    })

    rerender(
      buildTree({
        setCloneAddress,
        children: <span data-testid="child">child</span>,
        orderContextOverrides: {
          order: { id: "ord-2" },
        },
      })
    )

    await waitFor(() => {
      expect(getContext()._shipping_address_clone_id).toBe("")
      expect(getContext().shippingCustomerAddressId).toBeUndefined()
    })

    unmount()
  })
})
