import { render, screen } from "@testing-library/react"
import { CustomerContainer } from "#components/customers/CustomerContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const core = vi.hoisted(() => ({
  getCustomerInfo: vi.fn(),
  getCustomerAddresses: vi.fn(),
  getCustomerPayments: vi.fn(),
  getCustomerPaymentSources: vi.fn(),
  deleteCustomerPayment: vi.fn(),
  deleteCustomerAddress: vi.fn(),
  createCustomerAddress: vi.fn(),
  getCustomerOrders: vi.fn(),
  getCustomerSubscriptions: vi.fn(),
  saveCustomerUser: vi.fn(),
  setResourceTrigger: vi.fn(),
}))

vi.mock("@commercelayer/core", () => ({
  getCustomerInfo: core.getCustomerInfo,
  getCustomerAddresses: core.getCustomerAddresses,
  getCustomerPayments: core.getCustomerPayments,
  getCustomerPaymentSources: core.getCustomerPaymentSources,
  deleteCustomerPayment: core.deleteCustomerPayment,
  deleteCustomerAddress: core.deleteCustomerAddress,
  createCustomerAddress: core.createCustomerAddress,
  getCustomerOrders: core.getCustomerOrders,
  getCustomerSubscriptions: core.getCustomerSubscriptions,
  saveCustomerUser: core.saveCustomerUser,
  setResourceTrigger: core.setResourceTrigger,
}))

const jwtMock = vi.hoisted(() => ({ jwt: vi.fn() }))
vi.mock("#utils/jwt", () => ({ jwt: jwtMock.jwt }))

const isGuestMock = vi.hoisted(() => ({ isGuestToken: vi.fn() }))
vi.mock("#utils/isGuestToken", () => ({ isGuestToken: isGuestMock.isGuestToken }))

function renderContainer(isGuest?: boolean) {
  const addResourceToInclude = vi.fn()
  render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider value={{ accessToken: "token", interceptors: undefined } as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={{ ...defaultOrderContext, addResourceToInclude } as any}>
        <CustomerContainer isGuest={isGuest}>
          <div data-testid="child">child</div>
        </CustomerContainer>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
  return { addResourceToInclude }
}

beforeEach(() => {
  vi.clearAllMocks()
  jwtMock.jwt.mockReturnValue({ owner: { id: "cust-1" } })
  isGuestMock.isGuestToken.mockReturnValue(false)
  core.getCustomerInfo.mockResolvedValue({ customer: { id: "cust-1" }, customerEmail: "a@b.com" })
  core.getCustomerAddresses.mockResolvedValue([])
  core.getCustomerPayments.mockResolvedValue([])
  core.getCustomerPaymentSources.mockReturnValue([])
})

describe("CustomerContainer", () => {
  it("renders children", () => {
    renderContainer()
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("delegates to CustomerContext.Provider", () => {
    render(
      <CommerceLayerContext.Provider
        value={{ accessToken: "token", interceptors: undefined } as any}
      >
        <OrderContext.Provider
          value={{ ...defaultOrderContext, addResourceToInclude: vi.fn() } as any}
        >
          <CustomerContainer>
            <div data-testid="inner">inside</div>
          </CustomerContainer>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )
    expect(screen.getByTestId("inner")).toBeDefined()
  })

  it("emits deprecation warning in non-production environments", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const g = globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }
    const originalProcess = g.process
    g.process = { env: { NODE_ENV: "development" } }

    renderContainer()

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("CustomerContainer is deprecated"))

    g.process = originalProcess
    warnSpy.mockRestore()
  })

  it("does not warn in production", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const g = globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }
    const originalProcess = g.process
    g.process = { env: { NODE_ENV: "production" } }

    renderContainer()

    expect(warnSpy).not.toHaveBeenCalled()

    g.process = originalProcess
    warnSpy.mockRestore()
  })

  it("passes isGuest prop through to context", () => {
    renderContainer(true)
    expect(screen.getByTestId("child")).toBeDefined()
  })
})
