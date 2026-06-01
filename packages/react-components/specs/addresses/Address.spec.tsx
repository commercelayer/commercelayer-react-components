import type { Address as AddressType } from "@commercelayer/sdk"
import { act, render, screen, waitFor } from "@testing-library/react"
import Address from "#components/addresses/Address"
import AddressContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressContext from "#context/BillingAddressContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShippingAddressContext from "#context/ShippingAddressContext"

vi.mock("@commercelayer/core", () => ({}))

const mockAddress: AddressType = {
  id: "addr-1",
  type: "addresses",
  first_name: "John",
  last_name: "Doe",
  line_1: "123 Main St",
  city: "New York",
  country_code: "US",
  state_code: "NY",
  zip_code: "10001",
  phone: "+1-555-1234",
  reference: "cust-addr-1",
} as AddressType

const mockAddress2: AddressType = {
  id: "addr-2",
  type: "addresses",
  first_name: "Jane",
  last_name: "Smith",
  line_1: "456 Oak Ave",
  city: "Los Angeles",
  country_code: "US",
  state_code: "CA",
  zip_code: "90001",
  phone: "+1-555-5678",
  reference: "cust-addr-2",
} as AddressType

const mockSetBillingAddress = vi.fn()
const mockSetShippingAddress = vi.fn()

function renderAddress(
  props: Partial<Parameters<typeof Address>[0]> = {},
  contextOverrides: Record<string, unknown> = {}
) {
  return render(
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    <OrderContext.Provider value={{ ...defaultOrderContext, ...contextOverrides.order } as any}>
      <AddressContext.Provider
        value={
          {
            ...defaultAddressContext,
            setCloneAddress: vi.fn(),
            ...contextOverrides.address,
            // biome-ignore lint/suspicious/noExplicitAny: test cast
          } as any
        }
      >
        <BillingAddressContext.Provider
          value={
            {
              setBillingAddress: mockSetBillingAddress,
              billingCustomerAddressId: undefined,
              ...contextOverrides.billing,
            } as any /* biome-ignore lint/suspicious/noExplicitAny: test cast */
          }
        >
          <ShippingAddressContext.Provider
            value={
              {
                setShippingAddress: mockSetShippingAddress,
                shippingCustomerAddressId: undefined,
                ...contextOverrides.shipping,
              } as any /* biome-ignore lint/suspicious/noExplicitAny: test cast */
            }
          >
            <CustomerContext.Provider
              value={
                {
                  addresses: contextOverrides.customerAddresses as AddressType[] | undefined,
                } as any /* biome-ignore lint/suspicious/noExplicitAny: test cast */
              }
            >
              <Address selectedClassName="selected" disabledClassName="disabled" {...props}>
                <span data-testid="address-child">address content</span>
              </Address>
            </CustomerContext.Provider>
          </ShippingAddressContext.Provider>
        </BillingAddressContext.Provider>
      </AddressContext.Provider>
    </OrderContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSetBillingAddress.mockResolvedValue(undefined)
  mockSetShippingAddress.mockResolvedValue(undefined)
})

describe("Address", () => {
  it("renders one card per address from props", () => {
    renderAddress({ addresses: [mockAddress, mockAddress2] })
    expect(screen.getAllByTestId("address-child")).toHaveLength(2)
  })

  it("renders addresses from CustomerContext when addresses prop is empty", () => {
    renderAddress({ addresses: [] }, { customerAddresses: [mockAddress] })
    expect(screen.getAllByTestId("address-child")).toHaveLength(1)
  })

  it("renders nothing when no addresses", () => {
    const { container } = renderAddress({ addresses: [] })
    expect(container.querySelectorAll("[data-testid='address-child']")).toHaveLength(0)
  })

  it("applies selectedClassName on click", async () => {
    renderAddress({ addresses: [mockAddress] })
    const card = screen.getAllByTestId("address-child")[0].parentElement!
    await act(async () => {
      card.click()
    })
    await waitFor(() => {
      expect(card.className).toContain("selected")
    })
  })

  it("calls setBillingAddress on click", async () => {
    renderAddress({ addresses: [mockAddress] })
    const card = screen.getAllByTestId("address-child")[0].parentElement!
    await act(async () => {
      card.click()
    })
    expect(mockSetBillingAddress).toHaveBeenCalledWith("addr-1", {
      customerAddressId: "cust-addr-1",
    })
  })

  it("calls setShippingAddress on click when not disabled", async () => {
    renderAddress({ addresses: [mockAddress] })
    const card = screen.getAllByTestId("address-child")[0].parentElement!
    await act(async () => {
      card.click()
    })
    expect(mockSetShippingAddress).toHaveBeenCalledWith("addr-1", {
      customerAddressId: "cust-addr-1",
    })
  })

  it("calls onSelect callback with address", async () => {
    const onSelect = vi.fn()
    renderAddress({ addresses: [mockAddress], onSelect })
    const card = screen.getAllByTestId("address-child")[0].parentElement!
    await act(async () => {
      card.click()
    })
    expect(onSelect).toHaveBeenCalledWith(mockAddress)
  })

  it("filters out addresses when country_code does not match shipping_country_code_lock", () => {
    renderAddress(
      { addresses: [mockAddress] },
      {
        order: { order: { id: "ord-1", shipping_country_code_lock: "DE" } },
        shipping: { setShippingAddress: mockSetShippingAddress },
      }
    )
    // Address with US country code is filtered out when lock is DE
    expect(screen.queryAllByTestId("address-child")).toHaveLength(0)
  })

  it("clears addresses when deselect=true", async () => {
    renderAddress({ addresses: [mockAddress], deselect: true })
    await act(async () => {})
    expect(mockSetBillingAddress).toHaveBeenCalledWith("")
  })

  it("preselects billing address when billingCustomerAddressId matches reference", async () => {
    renderAddress(
      { addresses: [mockAddress, mockAddress2] },
      {
        billing: {
          setBillingAddress: mockSetBillingAddress,
          billingCustomerAddressId: "cust-addr-1",
        },
      }
    )
    await act(async () => {})
    // The first card should be selected
    await waitFor(() => {
      const cards = screen.getAllByTestId("address-child").map((el) => el.parentElement!)
      expect(cards[0].className).toContain("selected")
    })
  })

  it("renders function children via AddressCardsTemplate", () => {
    const child = vi.fn(({ customerAddresses }: { customerAddresses: any[] }) => (
      <span data-testid="fn-child">{customerAddresses.length}</span>
    ))
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const orderCtx = { ...defaultOrderContext } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const addressCtx = { ...defaultAddressContext, setCloneAddress: vi.fn() } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = { setBillingAddress: mockSetBillingAddress } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const shippingCtx = { setShippingAddress: mockSetShippingAddress } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customerCtx = {} as any
    render(
      <OrderContext.Provider value={orderCtx}>
        <AddressContext.Provider value={addressCtx}>
          <BillingAddressContext.Provider value={billingCtx}>
            <ShippingAddressContext.Provider value={shippingCtx}>
              <CustomerContext.Provider value={customerCtx}>
                <Address addresses={[mockAddress]} selectedClassName="selected">
                  {child}
                </Address>
              </CustomerContext.Provider>
            </ShippingAddressContext.Provider>
          </BillingAddressContext.Provider>
        </AddressContext.Provider>
      </OrderContext.Provider>
    )
    expect(child).toHaveBeenCalled()
  })

  it("preselects shipping address when shippingCustomerAddressId matches reference", async () => {
    renderAddress(
      { addresses: [mockAddress, mockAddress2] },
      {
        shipping: {
          setShippingAddress: mockSetShippingAddress,
          shippingCustomerAddressId: "cust-addr-2",
        },
      }
    )
    await waitFor(() => {
      const cards = screen.getAllByTestId("address-child").map((el) => el.parentElement!)
      expect(cards[1].className).toContain("selected")
    })
  })

  it("calls setBillingAddress via effect re-run when dep changes after address is selected", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const Wrapper = ({ extra }: { extra: boolean }) => (
      <OrderContext.Provider value={{ ...defaultOrderContext } as any}>
        <AddressContext.Provider
          value={
            {
              ...defaultAddressContext,
              setCloneAddress: vi.fn(),
              shipToDifferentAddress: extra,
            } as any
          }
        >
          <BillingAddressContext.Provider
            value={{ setBillingAddress: mockSetBillingAddress } as any}
          >
            <ShippingAddressContext.Provider
              value={{ setShippingAddress: mockSetShippingAddress } as any}
            >
              <CustomerContext.Provider value={{} as any}>
                <Address addresses={[mockAddress]} selectedClassName="selected">
                  <span data-testid="address-child">content</span>
                </Address>
              </CustomerContext.Provider>
            </ShippingAddressContext.Provider>
          </BillingAddressContext.Provider>
        </AddressContext.Provider>
      </OrderContext.Provider>
    )
    const { rerender } = render(<Wrapper extra={false} />)
    const card = screen.getAllByTestId("address-child")[0].parentElement!
    await act(async () => {
      card.click()
    })
    mockSetBillingAddress.mockClear()
    mockSetShippingAddress.mockClear()
    // Change shipToDifferentAddress to re-trigger the effect with selected=0
    await act(async () => {
      rerender(<Wrapper extra={true} />)
    })
    expect(mockSetBillingAddress).toHaveBeenCalledWith("addr-1", {
      customerAddressId: "cust-addr-1",
    })
    expect(mockSetShippingAddress).toHaveBeenCalledWith("addr-1", {
      customerAddressId: "cust-addr-1",
    })
  })

  it("renders address card with empty customerAddressId when reference is undefined", () => {
    const addressWithoutRef: AddressType = { ...mockAddress, reference: undefined }
    renderAddress({ addresses: [addressWithoutRef] })
    // address renders (covers address?.reference || "" branch — the "" fallback)
    expect(screen.queryAllByTestId("address-child").length).toBe(1)
  })
})
