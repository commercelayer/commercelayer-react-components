import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AddressStateSelector } from "#components/addresses/AddressStateSelector"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import type { DefaultContextAddress } from "#context/BillingAddressFormContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CustomerAddressFormContext from "#context/CustomerAddressFormContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

function renderSelector(
  props: Partial<Parameters<typeof AddressStateSelector>[0]> = {},
  billingOverrides: Partial<DefaultContextAddress> | null = {},
  shippingOverrides: Partial<DefaultContextAddress> | null = {}
) {
  const setValue = vi.fn()
  const billingCtx =
    billingOverrides !== null ? ({ setValue, errors: {}, ...billingOverrides } as any) : ({} as any)
  const shippingCtx =
    shippingOverrides !== null
      ? ({ setValue, errors: {}, ...shippingOverrides } as any)
      : ({} as any)
  return render(
    <BillingAddressFormContext.Provider value={billingCtx}>
      <ShippingAddressFormContext.Provider value={shippingCtx}>
        <CustomerAddressFormContext.Provider value={{} as any}>
          <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
            <AddressStateSelector name={"billing_address_state_code" as any} {...props} />
          </AddressesContext.Provider>
        </CustomerAddressFormContext.Provider>
      </ShippingAddressFormContext.Provider>
    </BillingAddressFormContext.Provider>
  )
}

describe("AddressStateSelector", () => {
  it("renders a text input when no country code is set (no states available)", () => {
    renderSelector()
    expect(screen.getByRole("textbox")).toBeTruthy()
  })

  it("renders a select when country code with states is provided via billing context", async () => {
    renderSelector(
      {},
      {
        values: {
          billing_address_country_code: "US",
        } as any,
      }
    )
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
  })

  it("renders a text input for country with no states (e.g. Singapore)", async () => {
    renderSelector(
      {},
      {
        values: {
          billing_address_country_code: "SG",
        } as any,
      }
    )
    await act(async () => {})
    expect(screen.getByRole("textbox")).toBeTruthy()
  })

  it("calls setValue on text input change", () => {
    const setValue = vi.fn()
    renderSelector({}, { setValue, errors: {} }, null)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "CA" } })
    expect(setValue).toHaveBeenCalledWith("billing_address_state_code", "CA")
  })

  it("applies errorClassName when billing field has error", async () => {
    renderSelector(
      {},
      {
        errors: {
          billing_address_state_code: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "input-error",
      },
      null // empty shipping context so it doesn't override billing error state
    )
    await act(async () => {})
    const input = screen.getByRole("textbox")
    expect(input.className).toContain("input-error")
  })

  it("uses shipping country code from shipping context", async () => {
    renderSelector(
      {},
      {},
      {
        values: {
          shipping_address_country_code: "US",
        } as any,
      }
    )
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
  })

  it("applies errorClassName when customer address field has error", async () => {
    const customerCtx = {
      errors: {
        billing_address_state_code: { code: "ERR", message: "required", error: true },
      },
      errorClassName: "customer-error",
      setValue: vi.fn(),
    } as any
    render(
      <BillingAddressFormContext.Provider value={{} as any}>
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={customerCtx}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    await act(async () => {})
    expect(screen.getByRole("textbox").className).toContain("customer-error")
  })

  it("applies errorClassName when shipping field has error (billing empty)", async () => {
    renderSelector({}, null, {
      errors: {
        billing_address_state_code: { code: "ERR", message: "required", error: true },
      },
      errorClassName: "shipping-error",
    })
    await act(async () => {})
    expect(screen.getByRole("textbox").className).toContain("shipping-error")
  })

  it("calls shipping setValue on text input change", () => {
    const shippingSetValue = vi.fn()
    renderSelector({}, null, { setValue: shippingSetValue, errors: {} })
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "TX" } })
    expect(shippingSetValue).toHaveBeenCalledWith("billing_address_state_code", "TX")
  })

  it("calls billing setValue when value prop changes", async () => {
    const setValue = vi.fn()
    const billingCtx = { setValue, errors: {} } as any
    const Wrapper = ({ stateValue }: { stateValue: string }) => (
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} value={stateValue} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    const { rerender } = render(<Wrapper stateValue="" />)
    await act(async () => {})
    // Change value from "" to "NY" — triggers effect re-run with val="" but value="NY"
    rerender(<Wrapper stateValue="NY" />)
    await act(async () => {})
    expect(setValue).toHaveBeenCalledWith("billing_address_state_code", "NY")
  })

  it("calls shipping setValue when value prop changes and shipping context has setValue", async () => {
    const billingSetValue = vi.fn()
    const shippingSetValue = vi.fn()
    const billingCtx = { setValue: billingSetValue, errors: {} } as any
    const shippingCtx = { setValue: shippingSetValue, errors: {} } as any
    const Wrapper = ({ stateValue }: { stateValue: string }) => (
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={shippingCtx}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} value={stateValue} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    const { rerender } = render(<Wrapper stateValue="" />)
    await act(async () => {})
    rerender(<Wrapper stateValue="TX" />)
    await act(async () => {})
    expect(shippingSetValue).toHaveBeenCalledWith("billing_address_state_code", "TX")
  })

  it("resets val when billing country changes to one with states and current val is invalid", async () => {
    const resetField = vi.fn()
    const Wrapper = ({ country }: { country: string }) => {
      const billingCtx = {
        setValue: vi.fn(),
        resetField,
        errors: {},
        values: { billing_address_country_code: country },
      } as any
      return (
        <BillingAddressFormContext.Provider value={billingCtx}>
          <ShippingAddressFormContext.Provider value={{} as any}>
            <CustomerAddressFormContext.Provider value={{} as any}>
              <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
                <AddressStateSelector name={"billing_address_state_code" as any} />
              </AddressesContext.Provider>
            </CustomerAddressFormContext.Provider>
          </ShippingAddressFormContext.Provider>
        </BillingAddressFormContext.Provider>
      )
    }
    // Start with US so countryCode state = "US" and stateOptions = US states
    const { rerender } = render(<Wrapper country="US" />)
    await act(async () => {})
    // Switch to CA — effect runs: changeBillingCountry=true, stateOptions=US states (not empty),
    // val="" is not a valid CA state → resetField called, setVal("")
    rerender(<Wrapper country="CA" />)
    await act(async () => {})
    expect(resetField).toHaveBeenCalledWith("billing_address_state_code")
  })

  it("resets val when shipping country changes to one with states and current val is invalid", async () => {
    const resetField = vi.fn()
    const Wrapper = ({ country }: { country: string }) => {
      const shippingCtx = {
        setValue: vi.fn(),
        resetField,
        errors: {},
        values: { shipping_address_country_code: country },
      } as any
      return (
        <BillingAddressFormContext.Provider value={{} as any}>
          <ShippingAddressFormContext.Provider value={shippingCtx}>
            <CustomerAddressFormContext.Provider value={{} as any}>
              <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
                <AddressStateSelector name={"billing_address_state_code" as any} />
              </AddressesContext.Provider>
            </CustomerAddressFormContext.Provider>
          </ShippingAddressFormContext.Provider>
        </BillingAddressFormContext.Provider>
      )
    }
    // Start with US so countryCode state = "US" and stateOptions = US states
    const { rerender } = render(<Wrapper country="US" />)
    await act(async () => {})
    // Switch to CA — effect runs: changeShippingCountry=true, stateOptions=US states (not empty),
    // val="" is not a valid CA state → shipping resetField called, setVal("")
    rerender(<Wrapper country="CA" />)
    await act(async () => {})
    expect(resetField).toHaveBeenCalledWith("billing_address_state_code")
  })

  it("does not show error className when customer context has no error (no-error path)", async () => {
    const customerCtx = {
      errors: {}, // non-empty object (has errors key but no error for this field)
      errorClassName: "customer-error",
      setValue: vi.fn(),
    } as any
    render(
      <BillingAddressFormContext.Provider value={{} as any}>
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={customerCtx}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    await act(async () => {})
    // No error for the field — errorClassName should NOT be applied
    expect(screen.getByRole("textbox").className).not.toContain("customer-error")
  })

  it("applies select className when country has states and field has an error", async () => {
    renderSelector(
      {},
      {
        values: { billing_address_country_code: "US" } as any,
        errors: {
          billing_address_state_code: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "billing-select-error",
      },
      null // no shipping context so billing hasError is not overridden by shipping
    )
    await waitFor(() => {
      const el = screen.getByRole("combobox")
      expect(el.className).toContain("billing-select-error")
    })
  })
})
