/**
 * Integration tests using the REAL rapid-form (no mock): editing a saved
 * address pre-fills every field, and the shared address state must keep all
 * of them (issue #958).
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import AddressInput from "#components/addresses/AddressInput"
import { CustomerAddressForm } from "#components/customers/CustomerAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

function renderEditForm() {
  // Like the reducer, each setAddress call replaces the whole billing_address.
  let billingAddress: Record<string, unknown> = {}
  const setAddress = vi.fn(({ values }: { values: Record<string, unknown> }) => {
    billingAddress = values
  })
  const addressContext = {
    ...defaultAddressContext,
    setAddressErrors: vi.fn(),
    setAddress,
  }
  const orderContext = { ...defaultOrderContext, order: { id: "ord-1" } }

  render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <AddressesContext.Provider value={addressContext as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={orderContext as any}>
        <CustomerAddressForm>
          <AddressInput name="billing_address_first_name" value="Jane" required />
          <AddressInput name="billing_address_last_name" value="Doe" required />
          <AddressInput name="billing_address_line_1" value="Via Roma 1" required />
          <AddressInput name="billing_address_line_2" value="Scala B" required={false} />
          <AddressInput name="billing_address_phone" value="555" data-testid="phone" />
        </CustomerAddressForm>
      </OrderContext.Provider>
    </AddressesContext.Provider>
  )

  return { getState: () => billingAddress }
}

const prefilled = {
  first_name: "Jane",
  last_name: "Doe",
  line_1: "Via Roma 1",
  line_2: "Scala B",
  phone: "555",
}

describe("CustomerAddressForm (real rapid-form)", () => {
  it("keeps every pre-filled field in the address state", async () => {
    const { getState } = renderEditForm()
    await waitFor(() => expect(getState()).toMatchObject(prefilled))
  })

  it("keeps the other fields when one is edited", async () => {
    const { getState } = renderEditForm()
    await waitFor(() => expect(getState()).toMatchObject(prefilled))

    await act(async () => {
      fireEvent.input(screen.getByTestId("phone"), { target: { value: "556" } })
    })

    await waitFor(() => expect(getState()).toMatchObject({ ...prefilled, phone: "556" }))
  })
})
