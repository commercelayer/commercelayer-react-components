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

  it("calls setValue on select dropdown change", async () => {
    const setValue = vi.fn()
    renderSelector(
      {},
      {
        setValue,
        errors: {},
        values: {
          billing_address_country_code: "US",
        } as any,
      },
      null
    )
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "CA" } })
    expect(setValue).toHaveBeenCalledWith("billing_address_state_code", "CA")
  })

  it("pre-fills state via setValue when country is set for the first time (edit existing address)", async () => {
    // When editing an existing address, country is pre-filled via setValue which
    // triggers changeBillingCountry=true (from "" to "US"). The state pre-fill
    // must also happen in this case (not only when changeBillingCountry=false).
    const setValue = vi.fn()
    renderSelector(
      { value: "CA" }, // existing state_code from API
      {
        setValue,
        errors: {},
        values: {
          billing_address_country_code: "US", // pre-filled country
        } as any,
      },
      null
    )
    await waitFor(() => {
      expect(setValue).toHaveBeenCalledWith("billing_address_state_code", "CA")
    })
  })

  it("shows state dropdown with pre-filled value when country arrives after first render", async () => {
    // Real-world scenario: country arrives asynchronously (after AddressCountrySelector.useEffect).
    // Step 1: render with no country. Step 2: country arrives in context. Step 3: state select must show.
    const setValue = vi.fn()
    const { rerender } = render(
      <BillingAddressFormContext.Provider value={{ setValue, errors: {}, values: {} } as any}>
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector
                name={"billing_address_state_code" as any}
                value="MI" // existing state_code from API
              />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )

    // Initially shows text input (no country)
    expect(screen.getByRole("textbox")).toBeTruthy()

    // Country arrives (simulates AddressCountrySelector.useEffect firing)
    rerender(
      <BillingAddressFormContext.Provider
        value={{
          setValue,
          errors: {},
          values: { billing_address_country_code: { value: "IT" } } as any,
        }}
      >
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} value="MI" />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )

    // Italian provinces select should now appear
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })

    // The pre-filled state code MI (Milano) should be selected
    const select = screen.getByRole("combobox") as HTMLSelectElement
    expect(select.value).toBe("MI")

    // setValue must have been called to sync into form context
    await waitFor(() => {
      expect(setValue).toHaveBeenCalledWith("billing_address_state_code", "MI")
    })
  })

  it("shows pre-filled state when value came from external setValue (no value prop)", async () => {
    // When AddressInput pre-fills state_code via billingAddress.setValue (setting the DOM value
    // directly), AddressStateSelector has no value prop but must still pick up the DOM value
    // when transitioning from text input to state select.
    const setValue = vi.fn()
    const { rerender } = render(
      <BillingAddressFormContext.Provider value={{ setValue, errors: {}, values: {} } as any}>
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              {/* No value prop — relies on DOM being pre-filled externally */}
              <AddressStateSelector name={"billing_address_state_code" as any} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )

    // Simulate an external setValue setting the DOM value (as AddressInput would do)
    const textInput = screen.getByRole("textbox") as HTMLInputElement
    textInput.value = "MI"

    // Country arrives
    rerender(
      <BillingAddressFormContext.Provider
        value={{
          setValue,
          errors: {},
          values: { billing_address_country_code: { value: "IT" } } as any,
        }}
      >
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })

    const select = screen.getByRole("combobox") as HTMLSelectElement
    expect(select.value).toBe("MI")
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

  it("pre-fills shipping state via setValue when shipping country is first detected", async () => {
    // Mirrors the billing pre-fill test but for shipping context (lines 162-163).
    // When editing an existing shipping address, shipping country arrives from "" → "US"
    // and the existing state_code must be pre-filled.
    const shippingSetValue = vi.fn()
    renderSelector(
      { name: "shipping_address_state_code" as any, value: "TX" },
      null, // no billing context
      {
        setValue: shippingSetValue,
        errors: {},
        values: { shipping_address_country_code: "US" } as any,
      }
    )
    await waitFor(() => {
      expect(shippingSetValue).toHaveBeenCalledWith("shipping_address_state_code", "TX")
    })
  })

  it("calls shipping setValue on select dropdown change", async () => {
    // Covers line 228 — the shippingAddress.setValue call inside BaseSelect onChange.
    const shippingSetValue = vi.fn()
    renderSelector(
      { name: "shipping_address_state_code" as any },
      null, // no billing context
      {
        setValue: shippingSetValue,
        errors: {},
        values: { shipping_address_country_code: "US" } as any,
      }
    )
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "TX" } })
    expect(shippingSetValue).toHaveBeenCalledWith("shipping_address_state_code", "TX")
  })

  it("skips setValue when shipping country first detected but no state value available (stateValue='')", async () => {
    // Covers line 161 false branch: changeShippingCountry && isFirstCountryDetection but stateValue=""
    const shippingSetValue = vi.fn()
    renderSelector(
      { name: "shipping_address_state_code" as any }, // no value prop
      null,
      {
        setValue: shippingSetValue,
        errors: {},
        values: { shipping_address_country_code: "US" } as any,
      }
    )
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
    // setValue should NOT have been called since stateValue=""
    expect(shippingSetValue).not.toHaveBeenCalled()
  })

  it("does not throw when shipping context has no resetField on country change with invalid state", async () => {
    // Covers line 177 false branch: shippingAddress.resetField is undefined
    const Wrapper = ({ country }: { country: string }) => {
      const shippingCtx = {
        setValue: vi.fn(),
        // no resetField in context
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
    const { rerender } = render(<Wrapper country="US" />)
    await act(async () => {})
    // Switch country — changeShippingCountry=true, !isFirstCountryDetection, invalid state
    // resetField is undefined → the `if (shippingAddress.resetField)` guard must not throw
    expect(() => {
      rerender(<Wrapper country="CA" />)
    }).not.toThrow()
  })

  it("does not throw when billing context has no resetField on country change with invalid state", async () => {
    // Covers line 145 false branch: billingAddress.resetField is undefined
    const Wrapper = ({ country }: { country: string }) => {
      const billingCtx = {
        setValue: vi.fn(),
        // no resetField in context
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
    const { rerender } = render(<Wrapper country="US" />)
    await act(async () => {})
    // Switch country — changeBillingCountry=true, !isFirstCountryDetection, invalid state
    // resetField is undefined → the `if (billingAddress.resetField)` guard must not throw
    expect(() => {
      rerender(<Wrapper country="CA" />)
    }).not.toThrow()
  })

  it("skips setValue when billing country first detected but no state value available (stateValue='')", async () => {
    // Covers line 126 ?? '' final fallback: no value prop, no textInputRef value
    const billingSetValue = vi.fn()
    renderSelector(
      { name: "billing_address_state_code" as any }, // no value prop
      {
        setValue: billingSetValue,
        errors: {},
        values: { billing_address_country_code: "US" } as any,
      },
      null
    )
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
    // No state pre-fill because stateValue=""
    expect(billingSetValue).not.toHaveBeenCalled()
  })

  it("sets val without calling setValue when billing context has no setValue on first country detection", async () => {
    // Covers line 128 false branch: billingAddress.setValue == null (no setValue in context)
    const Wrapper = ({ country }: { country: string }) => {
      // context has values (with country) but NO setValue function
      const billingCtx = {
        errors: {},
        values: { billing_address_country_code: country },
      } as any
      return (
        <BillingAddressFormContext.Provider value={billingCtx}>
          <ShippingAddressFormContext.Provider value={{} as any}>
            <CustomerAddressFormContext.Provider value={{} as any}>
              <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
                <AddressStateSelector name={"billing_address_state_code" as any} value="NY" />
              </AddressesContext.Provider>
            </CustomerAddressFormContext.Provider>
          </ShippingAddressFormContext.Provider>
        </BillingAddressFormContext.Provider>
      )
    }
    // Render with no country first so isFirstCountryDetection triggers
    const { rerender } = render(<Wrapper country="" />)
    await act(async () => {})
    // Country arrives — no setValue available, but setVal still runs
    rerender(<Wrapper country="US" />)
    await waitFor(() => {
      // Select shows (country arrived) — no error thrown
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
  })

  it("sets val without calling shipping setValue when shipping context has no setValue on first country detection", async () => {
    // Covers line 162 false branch: shippingAddress.setValue == null (no setValue in context)
    const Wrapper = ({ country }: { country: string }) => {
      const shippingCtx = {
        errors: {},
        values: { shipping_address_country_code: country },
      } as any
      return (
        <BillingAddressFormContext.Provider value={{} as any}>
          <ShippingAddressFormContext.Provider value={shippingCtx}>
            <CustomerAddressFormContext.Provider value={{} as any}>
              <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
                <AddressStateSelector name={"shipping_address_state_code" as any} value="TX" />
              </AddressesContext.Provider>
            </CustomerAddressFormContext.Provider>
          </ShippingAddressFormContext.Provider>
        </BillingAddressFormContext.Provider>
      )
    }
    const { rerender } = render(<Wrapper country="" />)
    await act(async () => {})
    rerender(<Wrapper country="US" />)
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy()
    })
  })

  it("updates val without calling billing setValue when value prop changes and setValue is null", async () => {
    // Covers line 117 false branch: billing context exists but has no setValue.
    // Trigger: type into input (changing val to "WA"), then rerender with value="CA".
    // In the effect: !changeBillingCountry (no country), value!==val, setValue==null → false branch.
    const noSetValueCtx = { errors: {}, values: {} } as any
    const Wrapper = ({ stateValue }: { stateValue: string }) => (
      <BillingAddressFormContext.Provider value={noSetValueCtx}>
        <ShippingAddressFormContext.Provider value={{} as any}>
          <CustomerAddressFormContext.Provider value={{} as any}>
            <AddressesContext.Provider value={{ ...defaultAddressContext, errors: [] } as any}>
              <AddressStateSelector name={"billing_address_state_code" as any} value={stateValue} />
            </AddressesContext.Provider>
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    const { rerender } = render(<Wrapper stateValue="NY" />)
    await act(async () => {})
    // Type in the input to change internal val to "WA" (setValue is null so nothing extra happens)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "WA" } })
    await act(async () => {})
    // Rerender with a different value prop — effect fires: value="CA", val="WA", no country
    // → !changeBillingCountry=true, value!==val, billingAddress.setValue==null → false branch
    rerender(<Wrapper stateValue="CA" />)
    await act(async () => {})
    expect(screen.getByRole("textbox")).toBeTruthy()
  })
})
