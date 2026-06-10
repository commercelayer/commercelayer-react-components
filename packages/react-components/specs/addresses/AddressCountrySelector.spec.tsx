import { act, render, screen } from "@testing-library/react"
import AddressCountrySelector from "#components/addresses/AddressCountrySelector"
import type { DefaultContextAddress } from "#context/BillingAddressFormContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CustomerAddressFormContext from "#context/CustomerAddressFormContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

vi.mock("@commercelayer/core", () => ({}))

const mockBillingCtx: Partial<DefaultContextAddress> = {
  setValue: vi.fn(),
  errors: {},
  errorClassName: "error",
}

const mockShippingCtx: Partial<DefaultContextAddress> = {
  setValue: vi.fn(),
  errors: {},
  errorClassName: "error",
}

const mockCustomerCtx: Partial<DefaultContextAddress> = {
  setValue: vi.fn(),
  errors: {},
  errorClassName: "error",
}

function renderSelector(
  props: Partial<Parameters<typeof AddressCountrySelector>[0]> = {},
  billingOverride: Partial<DefaultContextAddress> = {},
  shippingOverride: Partial<DefaultContextAddress> = {},
  customerOverride: Partial<DefaultContextAddress> = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const billingCtx = { ...mockBillingCtx, ...billingOverride } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const shippingCtx = { ...mockShippingCtx, ...shippingOverride } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const customerCtx = { ...mockCustomerCtx, ...customerOverride } as any
  return render(
    <BillingAddressFormContext.Provider value={billingCtx}>
      <ShippingAddressFormContext.Provider value={shippingCtx}>
        <CustomerAddressFormContext.Provider value={customerCtx}>
          <AddressCountrySelector name="billing_address_country_code" {...props} />
        </CustomerAddressFormContext.Provider>
      </ShippingAddressFormContext.Provider>
    </BillingAddressFormContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(mockBillingCtx.setValue as ReturnType<typeof vi.fn>).mockReset()
  ;(mockShippingCtx.setValue as ReturnType<typeof vi.fn>).mockReset()
  ;(mockCustomerCtx.setValue as ReturnType<typeof vi.fn>).mockReset()
})

describe("AddressCountrySelector", () => {
  it("renders a select element", () => {
    renderSelector()
    expect(screen.getByRole("combobox")).toBeTruthy()
  })

  it("shows the placeholder as selected when no value prop is provided", () => {
    renderSelector()
    const select = screen.getByRole("combobox") as HTMLSelectElement
    expect(select.value).toBe("")
    expect(screen.getByRole("option", { name: "Select an option" }).selected).toBe(true)
  })

  it("shows the placeholder when value prop is explicitly empty string", () => {
    renderSelector({ value: "" })
    const select = screen.getByRole("combobox") as HTMLSelectElement
    expect(select.value).toBe("")
    expect(screen.getByRole("option", { name: "Select an option" }).selected).toBe(true)
  })

  it("shows the placeholder when value prop is explicitly null (SDK may return null for unset country)", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing null prop
    renderSelector({ value: null as any })
    const select = screen.getByRole("combobox") as HTMLSelectElement
    expect(select.value).toBe("")
    expect(screen.getByRole("option", { name: "Select an option" }).selected).toBe(true)
  })

  it("pre-fills the country when value changes from null to a country code (order loading)", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = { ...mockBillingCtx } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const ctx = (v: any) => (
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={{ ...mockShippingCtx } as any}>
          <CustomerAddressFormContext.Provider value={{ ...mockCustomerCtx } as any}>
            <AddressCountrySelector name="billing_address_country_code" value={v} />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    // biome-ignore lint/suspicious/noExplicitAny: testing null prop
    const { rerender } = render(ctx(null as any))
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("")
    await act(async () => { rerender(ctx("IT")) })
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("IT")
  })

  it("preserves user selection when parent re-renders with same null value", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = { ...mockBillingCtx } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const ctx = (v: any) => (
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={{ ...mockShippingCtx } as any}>
          <CustomerAddressFormContext.Provider value={{ ...mockCustomerCtx } as any}>
            <AddressCountrySelector name="billing_address_country_code" value={v} />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    // biome-ignore lint/suspicious/noExplicitAny: testing null prop
    const { rerender } = render(ctx(null as any))
    const select = screen.getByRole("combobox") as HTMLSelectElement
    // Simulate user picking Italy via fireEvent
    const { fireEvent } = await import("@testing-library/react")
    fireEvent.change(select, { target: { value: "IT" } })
    expect(select.value).toBe("IT")
    // Parent re-renders with same null value — should NOT reset user's selection
    await act(async () => { rerender(ctx(null as any)) })
    expect(select.value).toBe("IT")
  })

  it("resets to placeholder when value changes from a country to empty", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = { ...mockBillingCtx } as any
    const { rerender } = render(
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={{ ...mockShippingCtx } as any}>
          <CustomerAddressFormContext.Provider value={{ ...mockCustomerCtx } as any}>
            <AddressCountrySelector name="billing_address_country_code" value="US" />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("US")
    await act(async () => {
      rerender(
        <BillingAddressFormContext.Provider value={billingCtx}>
          <ShippingAddressFormContext.Provider value={{ ...mockShippingCtx } as any}>
            <CustomerAddressFormContext.Provider value={{ ...mockCustomerCtx } as any}>
              <AddressCountrySelector name="billing_address_country_code" value="" />
            </CustomerAddressFormContext.Provider>
          </ShippingAddressFormContext.Provider>
        </BillingAddressFormContext.Provider>
      )
    })
    const select = screen.getByRole("combobox") as HTMLSelectElement
    expect(select.value).toBe("")
    expect(screen.getByRole("option", { name: "Select an option" }).selected).toBe(true)
  })

  it("calls billing setValue when value prop changes", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = { ...mockBillingCtx } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const shippingCtx = { ...mockShippingCtx } as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customerCtx = { ...mockCustomerCtx } as any
    const { rerender } = render(
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={shippingCtx}>
          <CustomerAddressFormContext.Provider value={customerCtx}>
            <AddressCountrySelector name="billing_address_country_code" value="" />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    await act(async () => {
      rerender(
        <BillingAddressFormContext.Provider value={billingCtx}>
          <ShippingAddressFormContext.Provider value={shippingCtx}>
            <CustomerAddressFormContext.Provider value={customerCtx}>
              <AddressCountrySelector name="billing_address_country_code" value="US" />
            </CustomerAddressFormContext.Provider>
          </ShippingAddressFormContext.Provider>
        </BillingAddressFormContext.Provider>
      )
    })
    expect(billingCtx.setValue).toHaveBeenCalledWith("billing_address_country_code", "US")
  })

  it("applies errorClassName when billing field has error", () => {
    renderSelector(
      {},
      {
        errors: {
          billing_address_country_code: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-error",
      }
    )
    expect(screen.getByRole("combobox").className).toContain("is-error")
  })

  it("does not apply errorClassName when no error", () => {
    renderSelector({}, { errors: {}, errorClassName: "is-error" })
    expect(screen.getByRole("combobox").className).not.toContain("is-error")
  })

  it("applies errorClassName when shipping field has error", () => {
    renderSelector(
      {},
      { errors: {}, errorClassName: "" }, // clear billing errorClassName
      {
        errors: {
          billing_address_country_code: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-error",
      }
    )
    expect(screen.getByRole("combobox").className).toContain("is-error")
  })

  it("applies errorClassName when customer address field has error", () => {
    renderSelector(
      {},
      { errors: {}, errorClassName: "" }, // clear billing
      { errors: {}, errorClassName: "" }, // clear shipping
      {
        errors: {
          billing_address_country_code: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-error",
      }
    )
    expect(screen.getByRole("combobox").className).toContain("is-error")
  })

  it("applies required by default", () => {
    renderSelector()
    expect(screen.getByRole("combobox").required).toBe(true)
  })

  it("allows required=false", () => {
    renderSelector({ required: false })
    expect(screen.getByRole("combobox").required).toBe(false)
  })
})
