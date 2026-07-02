/**
 * Integration tests using the REAL rapid-form (no mock).
 * Verifies that user typing updates formValues and triggers setAddress.
 * Also verifies pre-fill behavior (editing an existing address).
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import AddressInput from "#components/addresses/AddressInput"
import { BillingAddressForm } from "#components/addresses/BillingAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

// Do NOT mock rapid-form so real event listeners are used

vi.mock("#utils/localStorage", () => ({
  getSaveBillingAddressToAddressBook: vi.fn().mockReturnValue(false),
  getSaveShippingAddressToAddressBook: vi.fn().mockReturnValue(false),
  setCustomerOrderParam: vi.fn(),
  getLocalOrder: vi.fn(),
  setLocalOrder: vi.fn(),
  deleteLocalOrder: vi.fn(),
}))

function ContextProbe(): JSX.Element {
  const ctx = useContext(BillingAddressFormContext)
  return <div data-testid="ctx-values">{JSON.stringify(ctx.values ?? {})}</div>
}

interface RenderOptions {
  firstName?: string
  lastName?: string
  phone?: string
}

function renderRealForm(setAddress: ReturnType<typeof vi.fn>, prefill: RenderOptions = {}) {
  const addressContext = {
    ...defaultAddressContext,
    setAddressErrors: vi.fn(),
    setAddress,
    saveAddresses: vi.fn(),
  }
  const orderContext = {
    ...defaultOrderContext,
    order: { id: "ord-real" },
    include: ["billing_address"],
    includeLoaded: { billing_address: true },
    addResourceToInclude: vi.fn(),
  }

  return render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <AddressesContext.Provider value={addressContext as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={orderContext as any}>
        <BillingAddressForm data-testid="form">
          <AddressInput
            name="billing_address_first_name"
            data-testid="first-name"
            required
            {...(prefill.firstName != null ? { value: prefill.firstName } : {})}
          />
          <AddressInput
            name="billing_address_last_name"
            data-testid="last-name"
            required
            {...(prefill.lastName != null ? { value: prefill.lastName } : {})}
          />
          {/* phone is intentionally not required — tests non-required field preservation */}
          <AddressInput
            name="billing_address_phone"
            data-testid="phone"
            {...(prefill.phone != null ? { value: prefill.phone } : {})}
          />
          <ContextProbe />
        </BillingAddressForm>
      </OrderContext.Provider>
    </AddressesContext.Provider>
  )
}

describe("BillingAddressForm (real rapid-form)", () => {
  it("updates ctx.values when user types in a required input", async () => {
    const setAddress = vi.fn()
    renderRealForm(setAddress)

    const input = screen.getByTestId("first-name") as HTMLInputElement

    // rapid-form listens to 'input' events
    await act(async () => {
      fireEvent.input(input, { target: { value: "Alice" } })
    })

    await waitFor(() => {
      const ctxValues = JSON.parse(screen.getByTestId("ctx-values").textContent ?? "{}")
      expect(ctxValues.billing_address_first_name?.value).toBe("Alice")
    })
  })

  it("includes non-required DOM fields when user types a required field", async () => {
    const setAddress = vi.fn()
    renderRealForm(setAddress)

    const firstNameInput = screen.getByTestId("first-name") as HTMLInputElement
    const phoneInput = screen.getByTestId("phone") as HTMLInputElement

    // Simulate a pre-filled non-required field (no rapid-form tracking)
    await act(async () => {
      phoneInput.value = "555-1234"
    })

    // User types in a required field → triggers the main effect
    await act(async () => {
      fireEvent.input(firstNameInput, { target: { value: "Alice" } })
    })

    await waitFor(() => {
      const lastCall = setAddress.mock.calls[setAddress.mock.calls.length - 1][0]
      expect(lastCall.values).toMatchObject({
        first_name: "Alice",
        phone: "555-1234", // non-required field preserved from DOM
      })
    })
  })

  it("accumulates all field values when setValue is called for multiple fields (edit scenario)", async () => {
    const setAddress = vi.fn()
    // Render with pre-filled values simulating editing an existing address
    renderRealForm(setAddress, {
      firstName: "Jane",
      lastName: "Doe",
      phone: "555-9999",
    })

    // After pre-fill effects fire, the last setAddress call should have ALL fields
    await waitFor(() => {
      expect(setAddress).toHaveBeenCalled()
      const lastCall = setAddress.mock.calls[setAddress.mock.calls.length - 1][0]
      expect(lastCall.values).toMatchObject({
        first_name: "Jane",
        last_name: "Doe",
        phone: "555-9999",
      })
    })
  })

  it("updates ctx.values for required fields when setValue is called (needed by AddressStateSelector)", async () => {
    // AddressStateSelector watches billingAddress.values[country_key] to detect
    // the country and load the correct state options. setValue must dispatch
    // an 'input' event (not 'change') so rapid-form captures the update.
    const setAddress = vi.fn()
    let capturedCtx: ReturnType<typeof useContext<typeof BillingAddressFormContext>> | undefined

    function CountryProbe(): JSX.Element {
      capturedCtx = useContext(BillingAddressFormContext)
      return <div data-testid="country-value">{JSON.stringify(capturedCtx?.values ?? {})}</div>
    }

    const addressContext = {
      ...defaultAddressContext,
      setAddressErrors: vi.fn(),
      setAddress,
      saveAddresses: vi.fn(),
    }
    const orderContext = {
      ...defaultOrderContext,
      order: { id: "ord-country" },
      include: ["billing_address"],
      includeLoaded: { billing_address: true },
      addResourceToInclude: vi.fn(),
    }

    render(
      // biome-ignore lint/suspicious/noExplicitAny: test provider cast
      <AddressesContext.Provider value={addressContext as any}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
        <OrderContext.Provider value={orderContext as any}>
          <BillingAddressForm data-testid="form">
            {/* Country select is required by default */}
            <AddressInput
              name="billing_address_country_code"
              data-testid="country"
              required
              value="US"
            />
            <CountryProbe />
          </BillingAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    // After setValue fires (triggered by AddressInput.useEffect with value="US"),
    // ctx.values should contain the country code so AddressStateSelector can detect it.
    await waitFor(() => {
      const countryValues = JSON.parse(screen.getByTestId("country-value").textContent ?? "{}")
      expect(countryValues["billing_address_country_code"]?.value).toBe("US")
    })
  })
})
