import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { Customer, useCustomerProviderValue } from "#components/customers/Customer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext, { defaultCustomerContext } from "#context/CustomerContext"
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

vi.mock("@commercelayer/core-components", () => ({
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

// A probe that reads from CustomerContext and renders its state
function ContextProbe(): JSX.Element {
  const ctx = useContext(CustomerContext)
  return (
    <div>
      <div data-testid="customer-email">{ctx.customerEmail ?? "none"}</div>
      <div data-testid="addresses">{JSON.stringify(ctx.addresses ?? null)}</div>
      <div data-testid="is-guest">{String(ctx.isGuest)}</div>
    </div>
  )
}

const VALID_TOKEN = "valid-customer-token"
const CUSTOMER_ID = "cust-123"
const CUSTOMER_INFO = {
  customer: { id: CUSTOMER_ID, email: "user@example.com" },
  customerEmail: "user@example.com",
}
const MOCK_ADDRESSES = [{ id: "addr-1", full_name: "Alice", reference: "ref-1" }]
const MOCK_PAYMENTS: never[] = []

function renderCustomer(
  overrides: {
    accessToken?: string | null
    isGuest?: boolean
    orderOverrides?: Record<string, unknown>
    props?: Partial<React.ComponentProps<typeof Customer>>
  } = {}
) {
  const addResourceToInclude = vi.fn()
  const accessToken =
    overrides.accessToken === null ? undefined : (overrides.accessToken ?? VALID_TOKEN)
  const orderContext = {
    ...defaultOrderContext,
    addResourceToInclude,
    ...overrides.orderOverrides,
  }

  const result = render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider value={{ accessToken, interceptors: undefined } as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={orderContext as any}>
        <Customer isGuest={overrides.isGuest} {...overrides.props}>
          <ContextProbe />
        </Customer>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )

  return { ...result, addResourceToInclude }
}

beforeEach(() => {
  vi.clearAllMocks()
  jwtMock.jwt.mockReturnValue({ owner: { id: CUSTOMER_ID } })
  isGuestMock.isGuestToken.mockReturnValue(false)
  core.getCustomerInfo.mockResolvedValue(CUSTOMER_INFO)
  core.getCustomerAddresses.mockResolvedValue(MOCK_ADDRESSES)
  core.getCustomerPayments.mockResolvedValue(MOCK_PAYMENTS)
  core.getCustomerPaymentSources.mockReturnValue([])
})

describe("Customer (standalone)", () => {
  it("renders children inside the CustomerContext provider", async () => {
    renderCustomer()
    expect(screen.getByTestId("customer-email")).toBeDefined()
  })

  it("does not fetch data when no accessToken is provided", async () => {
    renderCustomer({ accessToken: null })
    await act(async () => {})
    expect(core.getCustomerInfo).not.toHaveBeenCalled()
  })

  it("does not fetch data when isGuest is true", async () => {
    isGuestMock.isGuestToken.mockReturnValue(false)
    renderCustomer({ isGuest: true })
    await act(async () => {})
    expect(core.getCustomerInfo).not.toHaveBeenCalled()
  })

  it("does not fetch data when access token is a guest token", async () => {
    isGuestMock.isGuestToken.mockReturnValue(true)
    renderCustomer()
    await act(async () => {})
    expect(core.getCustomerInfo).not.toHaveBeenCalled()
  })

  it("fetches customer info and addresses on mount", async () => {
    renderCustomer()
    await waitFor(() => {
      expect(screen.getByTestId("customer-email").textContent).toBe("user@example.com")
    })
    expect(core.getCustomerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: VALID_TOKEN, customerId: CUSTOMER_ID })
    )
    expect(core.getCustomerAddresses).toHaveBeenCalled()
  })

  it("exposes addresses in context after fetch", async () => {
    renderCustomer()
    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe("addr-1")
    })
  })

  it("sets isGuest in context", async () => {
    isGuestMock.isGuestToken.mockReturnValue(false)
    renderCustomer({ isGuest: false })
    expect(screen.getByTestId("is-guest").textContent).toBe("false")
  })

  it("adds resource includes when order context is present and not loaded", async () => {
    const include: string[] = []
    const includeLoaded: Record<string, boolean> = {}
    const addResourceToInclude = vi.fn()
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test provider cast
      <CommerceLayerContext.Provider value={{ accessToken: VALID_TOKEN } as any}>
        <OrderContext.Provider
          value={
            {
              ...defaultOrderContext,
              include,
              includeLoaded,
              addResourceToInclude,
            } as any
          }
        >
          <Customer>
            <div />
          </Customer>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )

    await waitFor(() => {
      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({
          newResource: expect.arrayContaining([
            "available_customer_payment_sources.payment_source",
          ]),
        })
      )
    })
  })

  it("marks includes as loaded when already present", async () => {
    const include = [
      "available_customer_payment_sources.payment_source",
      "available_customer_payment_sources.payment_method",
    ]
    const includeLoaded: Record<string, boolean> = {}
    const addResourceToInclude = vi.fn()
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test provider cast
      <CommerceLayerContext.Provider value={{ accessToken: VALID_TOKEN } as any}>
        <OrderContext.Provider
          value={
            {
              ...defaultOrderContext,
              include,
              includeLoaded,
              addResourceToInclude,
            } as any
          }
        >
          <Customer>
            <div />
          </Customer>
        </OrderContext.Provider>
      </CommerceLayerContext.Provider>
    )

    await waitFor(() => {
      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({
          newResourceLoaded: expect.objectContaining({
            "available_customer_payment_sources.payment_source": true,
          }),
        })
      )
    })
  })

  it("uses payment sources from order when available", async () => {
    const paymentSources = [{ id: "ps-1" }]
    core.getCustomerPaymentSources.mockReturnValue(paymentSources)
    renderCustomer({
      orderOverrides: {
        order: { id: "ord-1", available_customer_payment_sources: paymentSources },
      },
    })
    await waitFor(() => expect(core.getCustomerPaymentSources).toHaveBeenCalled())
  })

  it("does not fetch payments when order context is available with includes", async () => {
    renderCustomer({
      orderOverrides: {
        order: { id: "ord-1" },
        include: ["some_include"],
        includeLoaded: { some_include: true },
      },
    })
    await act(async () => {})
    expect(core.getCustomerPayments).not.toHaveBeenCalled()
  })
})

describe("useCustomerProviderValue", () => {
  function HookConsumer(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
    const value = useCustomerProviderValue(params)
    return (
      <CustomerContext.Provider value={value}>
        <ContextProbe />
      </CustomerContext.Provider>
    )
  }

  const addResourceToInclude = vi.fn()

  it("saveCustomerUser updates email in context", async () => {
    core.saveCustomerUser.mockResolvedValue(undefined)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(
      <Capture
        accessToken={VALID_TOKEN}
        addResourceToInclude={addResourceToInclude}
        order={{ id: "ord-1" } as any}
      />
    )

    await waitFor(() => expect(contextRef).toBeDefined())

    await act(async () => {
      await contextRef?.saveCustomerUser?.("new@example.com")
    })

    await waitFor(() => {
      expect(screen.getByTestId("customer-email").textContent).toBe("new@example.com")
    })
  })

  it("saveCustomerUser is a no-op when accessToken is missing", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)

    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.saveCustomerUser?.("new@example.com")
    })

    expect(core.saveCustomerUser).not.toHaveBeenCalled()
  })

  it("deleteCustomerAddress removes from state", async () => {
    core.deleteCustomerAddress.mockResolvedValue(undefined)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
    })

    await act(async () => {
      await contextRef?.deleteCustomerAddress?.({ customerAddressId: "ref-1" })
    })

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(0)
    })
  })

  it("deleteCustomerAddress is a no-op when accessToken is missing", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.deleteCustomerAddress?.({ customerAddressId: "ref-1" })
    })
    expect(core.deleteCustomerAddress).not.toHaveBeenCalled()
  })

  it("createCustomerAddress adds a new address to state", async () => {
    const newAddress = { id: "addr-2", full_name: "Bob", reference: "ref-2" }
    core.createCustomerAddress.mockResolvedValue(newAddress)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
    })

    await act(async () => {
      await contextRef?.createCustomerAddress?.({ full_name: "Bob" })
    })

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(2)
    })
  })

  it("createCustomerAddress updates existing address in state", async () => {
    const updatedAddress = { id: "addr-1", full_name: "Alice Updated", reference: "ref-1" }
    core.createCustomerAddress.mockResolvedValue(updatedAddress)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
    })

    await act(async () => {
      await contextRef?.createCustomerAddress?.({ id: "addr-1", full_name: "Alice Updated" })
    })

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed[0].full_name).toBe("Alice Updated")
    })
  })

  it("createCustomerAddress is a no-op when accessToken is missing", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.createCustomerAddress?.({ full_name: "Bob" })
    })
    expect(core.createCustomerAddress).not.toHaveBeenCalled()
  })

  it("deleteCustomerPayment refetches payments", async () => {
    const updatedPayments = [{ id: "pay-2" }]
    core.deleteCustomerPayment.mockResolvedValue(undefined)
    core.getCustomerPayments.mockResolvedValue(updatedPayments)

    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.deleteCustomerPayment?.({ customerPaymentSourceId: "ps-1" })
    })
    expect(core.deleteCustomerPayment).toHaveBeenCalled()
    expect(core.getCustomerPayments).toHaveBeenCalled()
  })

  it("deleteCustomerPayment is a no-op when accessToken is missing", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.deleteCustomerPayment?.({ customerPaymentSourceId: "ps-1" })
    })
    expect(core.deleteCustomerPayment).not.toHaveBeenCalled()
  })

  it("setCustomerErrors updates errors in context", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined
    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div data-testid="errors">{JSON.stringify(value.errors)}</div>
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      contextRef?.setCustomerErrors?.([
        { code: "VALIDATION_ERROR", message: "error", resource: "orders", field: "email" },
      ])
    })
    expect(screen.getByTestId("errors").textContent).toContain("VALIDATION_ERROR")
  })

  it("setCustomerEmail updates customerEmail in context", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined
    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div data-testid="email">{value.customerEmail ?? "none"}</div>
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      contextRef?.setCustomerEmail?.("updated@example.com")
    })
    expect(screen.getByTestId("email").textContent).toBe("updated@example.com")
  })

  it("getCustomerOrders fetches and updates orders in state", async () => {
    const mockOrders = [{ id: "ord-1" }]
    core.getCustomerOrders.mockResolvedValue(mockOrders)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div data-testid="orders">{JSON.stringify(value.orders)}</div>
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.getCustomerOrders?.({ pageNumber: 1, pageSize: 10 })
    })
    expect(screen.getByTestId("orders").textContent).toContain("ord-1")
  })

  it("getCustomerOrders is a no-op when accessToken or customerId is missing", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined
    jwtMock.jwt.mockReturnValue({ owner: null })

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.getCustomerOrders?.({ pageNumber: 1, pageSize: 10 })
    })
    expect(core.getCustomerOrders).not.toHaveBeenCalled()
  })

  it("getCustomerSubscriptions fetches and updates subscriptions", async () => {
    const mockSubs = [{ id: "sub-1" }]
    core.getCustomerSubscriptions.mockResolvedValue(mockSubs)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div data-testid="subs">{JSON.stringify(value.subscriptions)}</div>
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.getCustomerSubscriptions?.({ pageNumber: 1, pageSize: 10 })
    })
    expect(screen.getByTestId("subs").textContent).toContain("sub-1")
  })

  it("getCustomerSubscriptions is a no-op without accessToken", async () => {
    jwtMock.jwt.mockReturnValue({ owner: null })
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.getCustomerSubscriptions?.({ pageNumber: 1, pageSize: 10 })
    })
    expect(core.getCustomerSubscriptions).not.toHaveBeenCalled()
  })

  it("getCustomerAddresses refetches addresses", async () => {
    const refreshedAddresses = [{ id: "addr-999", full_name: "Refreshed", reference: "ref-999" }]
    core.getCustomerAddresses
      .mockResolvedValueOnce(MOCK_ADDRESSES)
      .mockResolvedValue(refreshedAddresses)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
    })

    await act(async () => {
      await contextRef?.getCustomerAddresses?.()
    })

    await waitFor(() => {
      const raw = screen.getByTestId("addresses").textContent ?? ""
      const parsed = JSON.parse(raw)
      expect(parsed[0].id).toBe("addr-999")
    })
  })

  it("getCustomerAddresses is a no-op without accessToken", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.getCustomerAddresses?.()
    })
    expect(core.getCustomerAddresses).not.toHaveBeenCalled()
  })

  it("reloadCustomerAddresses is an alias for getCustomerAddresses", async () => {
    const refreshed = [{ id: "addr-reload", full_name: "Reloaded", reference: "r" }]
    core.getCustomerAddresses.mockResolvedValueOnce(MOCK_ADDRESSES).mockResolvedValue(refreshed)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <ContextProbe />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId("addresses").textContent ?? "null")).toHaveLength(1)
    )
    await act(async () => {
      await contextRef?.reloadCustomerAddresses?.()
    })
    await waitFor(() => {
      expect(JSON.parse(screen.getByTestId("addresses").textContent ?? "null")[0].id).toBe(
        "addr-reload"
      )
    })
  })

  it("reloadCustomerAddresses is a no-op without accessToken", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.reloadCustomerAddresses?.()
    })
    expect(core.getCustomerAddresses).not.toHaveBeenCalled()
  })

  it("setResourceTrigger returns false when accessToken is missing", async () => {
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={undefined} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())

    let result: boolean | undefined
    await act(async () => {
      result = await contextRef?.setResourceTrigger?.({
        resource: "orders",
        attribute: "_reactivate",
        reloadList: false,
      })
    })
    expect(result).toBe(false)
  })

  it("setResourceTrigger triggers resource and reloads orders when requested", async () => {
    core.setResourceTrigger.mockResolvedValue(true)
    core.getCustomerOrders.mockResolvedValue([{ id: "ord-r" }])
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div data-testid="orders">{JSON.stringify(value.orders)}</div>
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.setResourceTrigger?.({
        resource: "orders",
        attribute: "_reactivate",
        reloadList: true,
      })
    })
    expect(core.setResourceTrigger).toHaveBeenCalled()
    expect(core.getCustomerOrders).toHaveBeenCalled()
  })

  it("setResourceTrigger triggers resource and reloads subscriptions when requested", async () => {
    core.setResourceTrigger.mockResolvedValue(true)
    core.getCustomerSubscriptions.mockResolvedValue([{ id: "sub-r" }])
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div data-testid="subs">{JSON.stringify(value.subscriptions)}</div>
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.setResourceTrigger?.({
        resource: "subscriptions",
        attribute: "_cancel",
        reloadList: true,
      })
    })
    expect(core.setResourceTrigger).toHaveBeenCalled()
    expect(core.getCustomerSubscriptions).toHaveBeenCalled()
  })

  it("setResourceTrigger does not reload when trigger returns false", async () => {
    core.setResourceTrigger.mockResolvedValue(false)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(<Capture accessToken={VALID_TOKEN} addResourceToInclude={addResourceToInclude} />)
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      await contextRef?.setResourceTrigger?.({
        resource: "orders",
        attribute: "_cancel",
        reloadList: true,
      })
    })
    expect(core.getCustomerOrders).not.toHaveBeenCalled()
  })

  it("getCustomerPaymentSources calls the core function and updates state", async () => {
    const paymentSources = [{ id: "ps-1" }]
    core.getCustomerPaymentSources.mockReturnValue(paymentSources)
    let contextRef: ReturnType<typeof useCustomerProviderValue> | undefined

    function Capture(params: Parameters<typeof useCustomerProviderValue>[0]): JSX.Element {
      const value = useCustomerProviderValue(params)
      contextRef = value
      return (
        <CustomerContext.Provider value={value}>
          <div />
        </CustomerContext.Provider>
      )
    }

    render(
      <Capture
        accessToken={VALID_TOKEN}
        addResourceToInclude={addResourceToInclude}
        order={{ id: "ord-1", available_customer_payment_sources: paymentSources } as any}
      />
    )
    await waitFor(() => expect(contextRef).toBeDefined())
    await act(async () => {
      contextRef?.getCustomerPaymentSources?.()
    })
    expect(core.getCustomerPaymentSources).toHaveBeenCalled()
  })
})
