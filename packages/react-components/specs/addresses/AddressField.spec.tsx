import { render, screen } from "@testing-library/react"
import AddressField from "#components/addresses/AddressField"
import AddressChildrenContext from "#context/AddressChildrenContext"
import CustomerContext from "#context/CustomerContext"

vi.mock("@commercelayer/core-components", () => ({}))

const mockAddress = {
  id: "addr-1",
  type: "addresses",
  first_name: "John",
  last_name: "Doe",
  line_1: "123 Main St",
  city: "New York",
  country_code: "US",
  state_code: "NY",
  zip_code: "10001",
  phone: "+1-555-1234",
  reference: "cust-addr-1",
}

function renderField(
  props: Parameters<typeof AddressField>[0],
  addressOverride = mockAddress,
  customerOverride: Record<string, unknown> = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const customerCtx = { deleteCustomerAddress: vi.fn(), ...customerOverride } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const addressChildCtx = { address: addressOverride } as any
  return render(
    <CustomerContext.Provider value={customerCtx}>
      <AddressChildrenContext.Provider value={addressChildCtx}>
        <AddressField {...props} />
      </AddressChildrenContext.Provider>
    </CustomerContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("AddressField", () => {
  it("renders a field value for the given name", () => {
    renderField({ type: "field", name: "first_name" })
    expect(screen.getByTestId("address-field-first_name").textContent).toBe("John")
  })

  it("renders empty string for missing field", () => {
    renderField({ type: "field", name: "first_name" }, { ...mockAddress, first_name: undefined })
    expect(screen.getByTestId("address-field-first_name").textContent).toBe("")
  })

  it("renders an edit anchor with label", () => {
    const onClick = vi.fn()
    renderField({ type: "edit", label: "Edit", onClick })
    expect(screen.getByTestId("address-field-").textContent).toBe("Edit")
  })

  it("calls onClick on edit click", () => {
    const onClick = vi.fn()
    renderField({ type: "edit", label: "Edit", onClick })
    screen.getByTestId("address-field-").click()
    expect(onClick).toHaveBeenCalledWith(mockAddress)
  })

  it("renders a delete anchor with label", () => {
    renderField({ type: "delete", label: "Delete", onClick: vi.fn() })
    expect(screen.getByTestId("address-field-").textContent).toBe("Delete")
  })

  it("calls deleteCustomerAddress on delete click", () => {
    const deleteCustomerAddress = vi.fn()
    renderField({ type: "delete", label: "Delete", onClick: vi.fn() }, mockAddress, {
      deleteCustomerAddress,
    })
    screen.getByTestId("address-field-").click()
    expect(deleteCustomerAddress).toHaveBeenCalledWith({ customerAddressId: "cust-addr-1" })
  })

  it("does not call deleteCustomerAddress if address has no reference", () => {
    const deleteCustomerAddress = vi.fn()
    renderField(
      { type: "delete", label: "Delete", onClick: vi.fn() },
      { ...mockAddress, reference: undefined },
      { deleteCustomerAddress }
    )
    screen.getByTestId("address-field-").click()
    expect(deleteCustomerAddress).not.toHaveBeenCalled()
  })

  it("renders custom children via render prop", () => {
    const child = vi.fn(() => <span data-testid="custom">custom</span>)
    renderField({ children: child })
    expect(screen.getByTestId("custom").textContent).toBe("custom")
    expect(child.mock.calls[0][0]).toMatchObject({ address: mockAddress })
  })

  it("renders field with undefined name — falls back to empty string in data-testid", () => {
    // Cast as any to bypass TypeScript — tests the name ?? "" fallback in the <p> element
    renderField({ type: "field" } as any)
    expect(screen.getByTestId("address-field-")).toBeTruthy()
  })
})
