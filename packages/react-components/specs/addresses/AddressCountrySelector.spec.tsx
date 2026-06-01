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
