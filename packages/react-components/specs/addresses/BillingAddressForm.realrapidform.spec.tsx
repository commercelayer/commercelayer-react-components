/**
 * Integration tests using the REAL rapid-form (no mock).
 * Verifies that user typing updates formValues and triggers setAddress.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { BillingAddressForm } from "#components/addresses/BillingAddressForm"
import AddressInput from "#components/addresses/AddressInput"
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
  return (
    <div>
      <div data-testid="ctx-values">{JSON.stringify(ctx.values ?? {})}</div>
    </div>
  )
}

function renderRealForm(setAddress: ReturnType<typeof vi.fn>) {
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

    // Simulate user typing — rapid-form listens to 'input' events
    await act(async () => {
      fireEvent.input(input, { target: { value: "Alice" } })
    })

    // ctx.values should now contain the typed value
    await waitFor(() => {
      const ctxValues = JSON.parse(screen.getByTestId("ctx-values").textContent ?? "{}")
      expect(ctxValues).toHaveProperty("billing_address_first_name")
      expect(ctxValues.billing_address_first_name.value).toBe("Alice")
    })
  })

  it("calls setAddress with address values after typing", async () => {
    const setAddress = vi.fn()
    renderRealForm(setAddress)

    const input = screen.getByTestId("first-name") as HTMLInputElement

    await act(async () => {
      fireEvent.input(input, { target: { value: "Alice" } })
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: "billing_address",
          values: expect.objectContaining({ first_name: "Alice" }),
        })
      )
    })
  })
})
