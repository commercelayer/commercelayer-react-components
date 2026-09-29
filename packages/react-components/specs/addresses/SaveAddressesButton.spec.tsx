import { useAddressForm } from "@commercelayer/react-hooks-components"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { type JSX, useEffect } from "react"
import { SaveAddressesButton } from "#components/addresses/SaveAddressesButton"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext, { defaultCustomerContext } from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

const filledAddress = {
  first_name: "John",
  last_name: "Doe",
  line_1: "123 Main St",
  city: "NYC",
  country_code: "US",
  zip_code: "10001",
  state_code: "NY",
  phone: "+1234567890",
}

/**
 * Stands in for the address forms: in standalone mode they publish what the
 * customer typed to the shared state, which is where the button reads it.
 * Each test uses its own access token so the states stay apart.
 */
function AddressFormStandIn({
  accessToken,
  orderId,
  billingAddress,
  shippingAddress,
  invertAddresses,
}: {
  accessToken: string
  orderId?: string
  billingAddress?: Record<string, unknown>
  shippingAddress?: Record<string, unknown>
  invertAddresses?: boolean
}): JSX.Element {
  const { setBillingAddress, setShippingAddress, setFlags } = useAddressForm({
    accessToken,
    orderId,
  })

  useEffect(() => {
    if (billingAddress != null) setBillingAddress(billingAddress)
    if (shippingAddress != null) setShippingAddress(shippingAddress)
    if (invertAddresses != null) setFlags({ invertAddresses })
  }, [
    billingAddress,
    shippingAddress,
    invertAddresses,
    setBillingAddress,
    setShippingAddress,
    setFlags,
  ])

  return <div data-testid="form-stand-in" />
}

function renderStandaloneButton({
  accessToken,
  billingAddress,
  shippingAddress,
  invertAddresses,
  props = {},
  customerOverrides = {},
  order,
  updateOrder,
}: {
  accessToken: string
  billingAddress?: Record<string, unknown>
  shippingAddress?: Record<string, unknown>
  invertAddresses?: boolean
  props?: Partial<Parameters<typeof SaveAddressesButton>[0]>
  customerOverrides?: Record<string, unknown>
  order?: Record<string, unknown>
  updateOrder?: (params: unknown) => Promise<unknown>
}) {
  const orderCtx = {
    ...defaultOrderContext,
    setOrderErrors: mockSetOrderErrors,
    order,
    orderId: order?.id,
    updateOrder,
  } as any
  const customerCtx = {
    ...defaultCustomerContext,
    isGuest: false,
    customerEmail: "",
    addresses: [],
    ...customerOverrides,
  } as any

  // No AddressesContext.Provider: the button is standalone, and the stand-in
  // form is its sibling — the shape #841 is about.
  return render(
    <CommerceLayerContext.Provider value={{ accessToken } as any}>
      <OrderContext.Provider value={orderCtx}>
        <CustomerContext.Provider value={customerCtx}>
          <AddressFormStandIn
            accessToken={accessToken}
            orderId={order?.id as string | undefined}
            billingAddress={billingAddress}
            shippingAddress={shippingAddress}
            invertAddresses={invertAddresses}
          />
          <SaveAddressesButton {...props} />
        </CustomerContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

// The standalone save lands on core-components, through the shared address hook.
const mockSaveOrderAddresses = vi.hoisted(() => vi.fn())
vi.mock("@commercelayer/core-components", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@commercelayer/core-components")>()),
  saveOrderAddresses: mockSaveOrderAddresses,
}))

const mockSaveAddresses = vi.fn()
const mockSetOrderErrors = vi.fn()
const mockOnClick = vi.fn()

function renderButton(
  props: Partial<Parameters<typeof SaveAddressesButton>[0]> = {},
  addressOverrides: Record<string, unknown> = {},
  orderOverrides: Record<string, unknown> = {},
  customerOverrides: Record<string, unknown> = {}
) {
  const addressCtx = {
    ...defaultAddressContext,
    errors: [],
    billing_address: {
      first_name: { value: "John" },
      last_name: { value: "Doe" },
      line_1: { value: "123 Main St" },
      city: { value: "NYC" },
      country_code: { value: "US" },
      zip_code: { value: "10001" },
      state_code: { value: "NY" },
      phone: { value: "+1234567890" },
    },
    shipping_address: {},
    shipToDifferentAddress: false,
    billingAddressId: "addr-1",
    shippingAddressId: undefined,
    invertAddresses: false,
    saveAddresses: mockSaveAddresses,
    ...addressOverrides,
  } as any
  const orderCtx = {
    ...defaultOrderContext,
    setOrderErrors: mockSetOrderErrors,
    order: {
      id: "ord-1",
      customer_email: "test@example.com",
      requires_billing_info: false,
    },
    ...orderOverrides,
  } as any
  const customerCtx = {
    ...defaultCustomerContext,
    isGuest: false,
    customerEmail: "test@example.com",
    addresses: [],
    ...customerOverrides,
  } as any
  return render(
    <OrderContext.Provider value={orderCtx}>
      <AddressesContext.Provider value={addressCtx}>
        <CustomerContext.Provider value={customerCtx}>
          <SaveAddressesButton {...props} />
        </CustomerContext.Provider>
      </AddressesContext.Provider>
    </OrderContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSaveOrderAddresses.mockResolvedValue({ success: false })
  mockSaveAddresses.mockResolvedValue({ success: true, order: { id: "ord-1" } })
})

describe("SaveAddressesButton", () => {
  it("renders with default label", () => {
    renderButton()
    expect(screen.getByRole("button").textContent).toBe("Continue to delivery")
  })

  it("renders with custom label", () => {
    renderButton({ label: "Save & Continue" })
    expect(screen.getByRole("button").textContent).toBe("Save & Continue")
  })

  it("renders with function label", () => {
    renderButton({ label: () => <span>Custom</span> })
    expect(screen.getByRole("button").textContent).toBe("Custom")
  })

  it("calls saveAddresses on click when form is valid", async () => {
    renderButton()
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
  })

  it("calls onClick with success result after saveAddresses resolves", async () => {
    renderButton({ onClick: mockOnClick })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })
  })

  it("renders function children", () => {
    const child = vi.fn().mockReturnValue(
      <button type="button" data-testid="custom-btn">
        Go
      </button>
    )
    renderButton({ children: child })
    expect(screen.getByTestId("custom-btn")).toBeTruthy()
  })

  it("does not call saveAddresses when errors are present", async () => {
    renderButton(
      {
        onClick: mockOnClick,
      },
      {
        errors: [
          {
            code: "VALIDATION_ERROR",
            message: "missing field",
            resource: "billing_address",
            field: "first_name",
          },
        ],
      }
    )
    fireEvent.click(screen.getByRole("button"))
    await act(async () => {})
    expect(mockSaveAddresses).not.toHaveBeenCalled()
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it("does not call onClick when saveAddresses returns failure", async () => {
    mockSaveAddresses.mockResolvedValue({ success: false })
    renderButton({ onClick: mockOnClick })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it("computes shippingAddressCleaned from non-empty shipping_address", async () => {
    // Test that the reduce over shipping_address (lines 66-67) executes
    renderButton(
      {},
      {
        shipping_address: {
          shipping_address_first_name: { value: "Jane" },
        },
        // Keep shipToDifferentAddress: false so button is not disabled by shipping
        shipToDifferentAddress: false,
      }
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
  })

  it("calls saveAddresses with addressId and customerAddress when addressId is provided", async () => {
    renderButton(
      { addressId: "addr-1", onClick: mockOnClick },
      {},
      {},
      { createCustomerAddress: vi.fn() }
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          customerAddress: expect.objectContaining({ id: "addr-1" }),
        })
      )
    })
  })

  it("saves what the sibling form typed, which is what #841 was about", async () => {
    const updateOrder = vi.fn().mockResolvedValue({ order: { id: "ord-841" } })
    mockSaveOrderAddresses.mockResolvedValue({
      success: true,
      orderAttributes: { id: "ord-841" },
    })

    renderStandaloneButton({
      accessToken: "tok-841",
      billingAddress: filledAddress,
      order: { id: "ord-841", customer_email: "john@example.com", requires_billing_info: false },
      updateOrder,
    })

    await waitFor(() => expect(screen.getByRole("button")).not.toHaveProperty("disabled", true))
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(mockSaveOrderAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          billingAddress: expect.objectContaining({ first_name: "John" }),
        })
      )
    })
    // The order is written through OrderContext, so the checkout learns about it.
    await waitFor(() => expect(updateOrder).toHaveBeenCalled())
  })

  it("saves to the customer address book when there is no order", async () => {
    const createCustomerAddress = vi.fn()
    renderStandaloneButton({
      accessToken: "tok-address-book",
      billingAddress: filledAddress,
      customerOverrides: { createCustomerAddress },
    })

    await waitFor(() => expect(screen.getByRole("button")).not.toHaveProperty("disabled", true))
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(createCustomerAddress).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: "John" })
      )
    })
  })

  it("uses shipping_address resource when invertAddresses is true and addressId provided", async () => {
    const createCustomerAddress = vi.fn()
    renderButton(
      { addressId: "addr-1" },
      { invertAddresses: true, shippingAddressId: "ship-1", errors: [] },
      {},
      { createCustomerAddress }
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          customerAddress: expect.objectContaining({ resource: "shipping_address" }),
        })
      )
    })
  })

  it("saves the shipping address to the book when the addresses are inverted", async () => {
    const createCustomerAddress = vi.fn()
    renderStandaloneButton({
      accessToken: "tok-address-book-inverted",
      shippingAddress: filledAddress,
      invertAddresses: true,
      props: { addressId: "my-addr" },
      customerOverrides: { createCustomerAddress },
    })

    await waitFor(() => expect(screen.getByRole("button")).not.toHaveProperty("disabled", true))
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(createCustomerAddress).toHaveBeenCalledWith(expect.objectContaining({ id: "my-addr" }))
    })
  })

  it("is disabled when isGuest is true and no customer_email on order", () => {
    renderButton(
      {},
      {},
      { order: { id: "ord-1", requires_billing_info: false, customer_email: null } },
      { isGuest: true, customerEmail: null }
    )
    const btn = screen.getByRole("button")
    expect(btn.hasAttribute("disabled")).toBe(true)
  })

  it("handles undefined shippingAddress gracefully (shippingAddress ?? {} fallback)", () => {
    renderButton({}, { shipping_address: undefined, errors: [] })
    // Component renders without crashing when shippingAddress is undefined
    expect(screen.getByRole("button")).toBeTruthy()
  })

  it("does not call saveAddresses when handleClick is blocked by non-empty errors", async () => {
    renderButton(
      {},
      {
        errors: [
          { code: "EMPTY_ERROR", resource: "billing_address", field: "city", message: "required" },
        ],
      }
    )
    fireEvent.click(screen.getByRole("button"))
    await new Promise((r) => setTimeout(r, 50))
    expect(mockSaveAddresses).not.toHaveBeenCalled()
  })
})

describe("SaveAddressesButton (errorMode='submit')", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveAddresses.mockResolvedValue({ success: true, order: { id: "ord-1" } })
  })

  function renderButtonWithFormCtx(
    billingCtxOverrides: Record<string, unknown> = {},
    shippingCtxOverrides: Record<string, unknown> = {}
  ) {
    const addressCtx = {
      ...defaultAddressContext,
      errors: [],
      billing_address: {
        first_name: { value: "John" },
        last_name: { value: "Doe" },
        line_1: { value: "123 Main St" },
        city: { value: "NYC" },
        country_code: { value: "US" },
        zip_code: { value: "10001" },
        state_code: { value: "NY" },
        phone: { value: "+1234567890" },
      },
      shipping_address: {},
      shipToDifferentAddress: false,
      billingAddressId: "addr-1",
      shippingAddressId: undefined,
      invertAddresses: false,
      saveAddresses: mockSaveAddresses,
    } as any
    const orderCtx = {
      ...defaultOrderContext,
      setOrderErrors: mockSetOrderErrors,
      order: { id: "ord-1", customer_email: "test@example.com", requires_billing_info: false },
    } as any
    const customerCtx = {
      ...defaultCustomerContext,
      isGuest: false,
      customerEmail: "test@example.com",
      addresses: [],
    } as any

    return render(
      <BillingAddressFormContext.Provider
        value={
          {
            errorMode: "submit",
            validate: vi.fn().mockReturnValue({}),
            ...billingCtxOverrides,
          } as any
        }
      >
        <ShippingAddressFormContext.Provider
          value={{ errorMode: "inline", ...shippingCtxOverrides } as any}
        >
          <OrderContext.Provider value={orderCtx}>
            <AddressesContext.Provider value={addressCtx}>
              <CustomerContext.Provider value={customerCtx}>
                <SaveAddressesButton />
              </CustomerContext.Provider>
            </AddressesContext.Provider>
          </OrderContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
  }

  it("calls billing validate() when errorMode='submit' and proceeds when valid", async () => {
    const mockValidate = vi.fn().mockReturnValue({})
    renderButtonWithFormCtx({ errorMode: "submit", validate: mockValidate })

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
  })

  it("blocks save when billing validate() returns errors", async () => {
    const mockValidate = vi.fn().mockReturnValue({
      billing_address_first_name: { code: "VALIDATION_ERROR", message: "Required", error: true },
    })
    renderButtonWithFormCtx({ errorMode: "submit", validate: mockValidate })

    fireEvent.click(screen.getByRole("button"))
    await act(async () => {})

    expect(mockValidate).toHaveBeenCalled()
    expect(mockSaveAddresses).not.toHaveBeenCalled()
  })

  it("calls shipping validate() when shipping errorMode='submit' and blocks if errors", async () => {
    const mockBillingValidate = vi.fn().mockReturnValue({})
    const mockShippingValidate = vi.fn().mockReturnValue({
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: "Required", error: true },
    })
    renderButtonWithFormCtx(
      { errorMode: "inline" },
      { errorMode: "submit", validate: mockShippingValidate }
    )

    fireEvent.click(screen.getByRole("button"))
    await act(async () => {})

    expect(mockShippingValidate).toHaveBeenCalled()
    expect(mockBillingValidate).not.toHaveBeenCalled()
    expect(mockSaveAddresses).not.toHaveBeenCalled()
  })

  it("skips validate() when both forms use errorMode='inline'", async () => {
    const mockValidate = vi.fn().mockReturnValue({})
    renderButtonWithFormCtx(
      { errorMode: "inline", validate: mockValidate },
      { errorMode: "inline", validate: mockValidate }
    )

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
    expect(mockValidate).not.toHaveBeenCalled()
  })

  it("proceeds when billing errorMode='submit' but validate is undefined (covers ?? {} branch)", async () => {
    // Covers lines 105-107: billingFormCtx.validate?.() ?? {} — the undefined path
    renderButtonWithFormCtx({ errorMode: "submit", validate: undefined })

    fireEvent.click(screen.getByRole("button"))

    // validate is undefined → ?? {} → no errors → save proceeds
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
  })

  it("proceeds when shipping errorMode='submit' but validate is undefined (covers shipping ?? {} branch)", async () => {
    // Covers line 107: shippingFormCtx.validate?.() ?? {} — the undefined path
    renderButtonWithFormCtx({ errorMode: "inline" }, { errorMode: "submit", validate: undefined })

    fireEvent.click(screen.getByRole("button"))

    // shipping validate is undefined → ?? {} → no errors → save proceeds
    await waitFor(() => {
      expect(mockSaveAddresses).toHaveBeenCalled()
    })
  })

  it("blocks save when AddressContext has API errors even after submit validation passes", async () => {
    // Covers line 112: if (Object.keys(errors!).length === 0) — the false branch.
    // Use children function to bypass disabled-button check and call handleClick directly.
    const mockValidate = vi.fn().mockReturnValue({})
    const addressCtx = {
      errors: [
        { code: "API_ERROR", resource: "billing_address", field: "line_1", message: "Invalid" },
      ],
      billing_address: {
        first_name: { value: "John" },
        last_name: { value: "Doe" },
        line_1: { value: "123 Main St" },
        city: { value: "NYC" },
        country_code: { value: "US" },
        zip_code: { value: "10001" },
        state_code: { value: "NY" },
        phone: { value: "+1234567890" },
      },
      shipping_address: {},
      shipToDifferentAddress: false,
      billingAddressId: "addr-1",
      shippingAddressId: undefined,
      invertAddresses: false,
      saveAddresses: mockSaveAddresses,
    } as any
    const orderCtx = {
      ...defaultOrderContext,
      setOrderErrors: mockSetOrderErrors,
      order: { id: "ord-1", customer_email: "test@example.com", requires_billing_info: false },
    } as any
    const customerCtx = {
      ...defaultCustomerContext,
      isGuest: false,
      customerEmail: "test@example.com",
      addresses: [],
    } as any

    render(
      <BillingAddressFormContext.Provider
        value={{ errorMode: "submit", validate: mockValidate } as any}
      >
        {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
        <ShippingAddressFormContext.Provider value={{ errorMode: "inline" } as any}>
          <OrderContext.Provider value={orderCtx}>
            <AddressesContext.Provider value={addressCtx}>
              <CustomerContext.Provider value={customerCtx}>
                {/* Use children function to bypass disabled state and call handleClick directly */}
                <SaveAddressesButton>
                  {/* biome-ignore lint/suspicious/noExplicitAny: ChildrenFunction type */}
                  {({ handleClick }: any) => (
                    <button type="button" data-testid="inner-btn" onClick={() => handleClick()}>
                      Save
                    </button>
                  )}
                </SaveAddressesButton>
              </CustomerContext.Provider>
            </AddressesContext.Provider>
          </OrderContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )

    fireEvent.click(screen.getByTestId("inner-btn"))
    await act(async () => {})

    // validate() called (submit mode), passed (no form errors), but API errors block save
    expect(mockValidate).toHaveBeenCalled()
    expect(mockSaveAddresses).not.toHaveBeenCalled()
  })
})
