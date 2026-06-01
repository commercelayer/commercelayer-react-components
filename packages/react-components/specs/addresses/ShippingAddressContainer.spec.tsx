import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import ShippingAddressContainer from "#components/addresses/ShippingAddressContainer"
import AddressContext, { defaultAddressContext } from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShippingAddressContext from "#context/ShippingAddressContext"

vi.mock("@commercelayer/core", () => ({ updateAddressReference: vi.fn() }))

let latestSetShippingAddress: unknown

function ContextProbe(): JSX.Element {
  const { setShippingAddress } = useContext(ShippingAddressContext)
  latestSetShippingAddress = setShippingAddress
  return null
}

function renderContainer(children?: ReactNode) {
  latestSetShippingAddress = undefined

  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const commerceLayerValue = { accessToken: "test-token" } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const orderValue = { ...defaultOrderContext, addResourceToInclude: vi.fn() } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const addressValue = { ...defaultAddressContext, setCloneAddress: vi.fn() } as any

  return render(
    <CommerceLayerContext.Provider value={commerceLayerValue}>
      <OrderContext.Provider value={orderValue}>
        <AddressContext.Provider value={addressValue}>
          <ShippingAddressContainer>{children ?? <span>child</span>}</ShippingAddressContainer>
        </AddressContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

beforeEach(() => {
  latestSetShippingAddress = undefined
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe("ShippingAddressContainer", () => {
  it("warns in dev", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      renderContainer()
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[ShippingAddressContainer] is deprecated")
    )
    warnSpy.mockRestore()
  })

  it("does not warn in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      renderContainer()
    })

    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it("renders children", async () => {
    await act(async () => {
      renderContainer(<span>child</span>)
    })

    expect(screen.getByText("child")).toBeDefined()
  })

  it("delegates to ShippingAddress: provides ShippingAddressContext", async () => {
    await act(async () => {
      renderContainer(<ContextProbe />)
    })

    expect(latestSetShippingAddress).toBeTypeOf("function")
  })
})
