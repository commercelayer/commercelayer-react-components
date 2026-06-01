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
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const billingCtx =
    billingOverrides !== null ? ({ setValue, errors: {}, ...billingOverrides } as any) : ({} as any)
  // biome-ignore lint/suspicious/noExplicitAny: test cast
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

  it("calls billing setValue when value prop changes", async () => {
    const setValue = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: test cast
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
})
