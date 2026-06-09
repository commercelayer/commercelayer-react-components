import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SaveAddressesButton } from "#components/addresses/SaveAddressesButton"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"
import CustomerContext, { defaultCustomerContext } from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const mockSaveAddresses = vi.fn()
const mockSetOrderErrors = vi.fn()
const mockOnClick = vi.fn()

function renderButton(
  props: Partial<Parameters<typeof SaveAddressesButton>[0]> = {},
  addressOverrides: Record<string, unknown> = {},
  orderOverrides: Record<string, unknown> = {},
  customerOverrides: Record<string, unknown> = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
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
  // biome-ignore lint/suspicious/noExplicitAny: test cast
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
  // biome-ignore lint/suspicious/noExplicitAny: test cast
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

  it("calls createCustomerAddress when no order/saveAddresses but createCustomerAddress exists", async () => {
    const createCustomerAddress = vi.fn()
    renderButton(
      {},
      { saveAddresses: undefined, errors: [] },
      { order: undefined },
      { createCustomerAddress, isGuest: false, customerEmail: "" }
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(createCustomerAddress).toHaveBeenCalled()
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

  it("calls createCustomerAddress with invertAddresses true (shippingAddress path) and addressId", async () => {
    const createCustomerAddress = vi.fn()
    renderButton(
      { addressId: "my-addr" },
      {
        saveAddresses: undefined,
        invertAddresses: true,
        shippingAddressId: "ship-1",
        shipping_address: {},
        errors: [],
      },
      { order: undefined },
      { createCustomerAddress, isGuest: false, customerEmail: "" }
    )
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
    // biome-ignore lint/suspicious/noExplicitAny: test cast
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
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const orderCtx = {
      ...defaultOrderContext,
      setOrderErrors: mockSetOrderErrors,
      order: { id: "ord-1", customer_email: "test@example.com", requires_billing_info: false },
    } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customerCtx = {
      ...defaultCustomerContext,
      isGuest: false,
      customerEmail: "test@example.com",
      addresses: [],
    } as any

    return render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <BillingAddressFormContext.Provider value={{ errorMode: "submit", validate: vi.fn().mockReturnValue({}), ...billingCtxOverrides } as any}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test cast */}
        <ShippingAddressFormContext.Provider value={{ errorMode: "inline", ...shippingCtxOverrides } as any}>
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
    renderButtonWithFormCtx(
      { errorMode: "inline" },
      { errorMode: "submit", validate: undefined }
    )

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
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const addressCtx = {
      errors: [{ code: "API_ERROR", resource: "billing_address", field: "line_1", message: "Invalid" }],
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
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const orderCtx = {
      ...defaultOrderContext,
      setOrderErrors: mockSetOrderErrors,
      order: { id: "ord-1", customer_email: "test@example.com", requires_billing_info: false },
    } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customerCtx = {
      ...defaultCustomerContext,
      isGuest: false,
      customerEmail: "test@example.com",
      addresses: [],
    } as any

    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <BillingAddressFormContext.Provider value={{ errorMode: "submit", validate: mockValidate } as any}>
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
