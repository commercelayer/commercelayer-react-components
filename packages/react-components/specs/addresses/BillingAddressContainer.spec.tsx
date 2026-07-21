import { act, render, screen } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import BillingAddressContainer from "#components/addresses/BillingAddressContainer"
import AddressContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressContext from "#context/BillingAddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

vi.mock("@commercelayer/core-components", () => ({ updateAddressReference: vi.fn() }))

let latestSetBillingAddress: unknown

function ContextProbe(): JSX.Element {
  const { setBillingAddress } = useContext(BillingAddressContext)
  latestSetBillingAddress = setBillingAddress
  return null
}

function renderContainer(children?: ReactNode) {
  latestSetBillingAddress = undefined

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
          <BillingAddressContainer>{children ?? <span>child</span>}</BillingAddressContainer>
        </AddressContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

beforeEach(() => {
  latestSetBillingAddress = undefined
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe("BillingAddressContainer", () => {
  it("warns in dev", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await act(async () => {
      renderContainer()
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[BillingAddressContainer] is deprecated")
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

  it("delegates to BillingAddress: provides BillingAddressContext", async () => {
    await act(async () => {
      renderContainer(<ContextProbe />)
    })

    expect(latestSetBillingAddress).toBeTypeOf("function")
  })
})
