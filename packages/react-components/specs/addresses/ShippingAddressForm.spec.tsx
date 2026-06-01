import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { ShippingAddressForm } from "#components/addresses/ShippingAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

const rapidForm = vi.hoisted(() => ({
  useRapidForm: vi.fn(),
}))

vi.mock("rapid-form", () => ({
  useRapidForm: rapidForm.useRapidForm,
}))

const mockSetAddress = vi.fn()
const mockSetAddressErrors = vi.fn()
const mockAddResourceToInclude = vi.fn()
const mockSaveAddressToCustomerAddressBook = vi.fn()

function ContextProbe(): JSX.Element {
  const ctx = useContext(ShippingAddressFormContext)
  return (
    <div
      data-testid="probe"
      data-error-class={ctx.errorClassName ?? ""}
      // biome-ignore lint/suspicious/noExplicitAny: test probe
      {...({
        onClick: () => (ctx as any).setValue?.("shipping_address_first_name", "Jane"),
      } as any)}
    />
  )
}

function renderForm(
  formProps: Partial<Parameters<typeof ShippingAddressForm>[0]> = {},
  orderOverrides: Record<string, unknown> = {},
  addressOverrides: Record<string, unknown> = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const orderCtx = {
    ...defaultOrderContext,
    addResourceToInclude: mockAddResourceToInclude,
    saveAddressToCustomerAddressBook: mockSaveAddressToCustomerAddressBook,
    include: [],
    includeLoaded: {},
    order: { id: "ord-1" },
    ...orderOverrides,
  } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const addressCtx = {
    ...defaultAddressContext,
    setAddress: mockSetAddress,
    setAddressErrors: mockSetAddressErrors,
    shipToDifferentAddress: true,
    isBusiness: false,
    ...addressOverrides,
  } as any
  return render(
    <OrderContext.Provider value={orderCtx}>
      <AddressesContext.Provider value={addressCtx}>
        <ShippingAddressForm data-testid="shipping-form" {...formProps}>
          <ContextProbe />
        </ShippingAddressForm>
      </AddressesContext.Provider>
    </OrderContext.Provider>
  )
}

const defaultRapidFormReturn = {
  validation: undefined,
  values: {},
  errors: {},
  reset: vi.fn(),
  setValue: vi.fn(),
  setError: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn })
})

describe("ShippingAddressForm", () => {
  it("renders a form element with children", () => {
    renderForm()
    expect(screen.getByTestId("shipping-form")).toBeTruthy()
    expect(screen.getByTestId("probe")).toBeTruthy()
  })

  it("calls addResourceToInclude for shipping_address on mount", async () => {
    renderForm()
    await waitFor(() => {
      expect(mockAddResourceToInclude).toHaveBeenCalledWith({
        newResource: "shipping_address",
      })
    })
  })

  it("calls addResourceToInclude with newResourceLoaded when already included", async () => {
    renderForm({}, { include: ["shipping_address"], includeLoaded: {} })
    await waitFor(() => {
      expect(mockAddResourceToInclude).toHaveBeenCalledWith({
        newResourceLoaded: { shipping_address: true },
      })
    })
  })

  it("exposes errorClassName through context", () => {
    renderForm({ errorClassName: "field-error" })
    expect(screen.getByTestId("probe").getAttribute("data-error-class")).toBe("field-error")
  })

  it("calls setAddressErrors when form has errors and shipToDifferentAddress is true", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {
        shipping_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
    })
    renderForm({}, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            resource: "shipping_address",
            field: "shipping_address_first_name",
          }),
        ]),
        "shipping_address"
      )
    })
  })

  it("calls setAddress when values are valid and shipToDifferentAddress is true", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        shipping_address_first_name: { value: "Jane", required: true, type: "text" },
      },
    })
    renderForm({}, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith([], "shipping_address")
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "shipping_address" })
      )
    })
  })

  it("does not call setAddress when shipToDifferentAddress is false", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        shipping_address_first_name: { value: "Jane", required: true, type: "text" },
      },
    })
    renderForm({}, {}, { shipToDifferentAddress: false })
    await act(async () => {})
    expect(mockSetAddress).not.toHaveBeenCalled()
  })

  it("accepts autoComplete and forwarded props", () => {
    renderForm({ autoComplete: "off" })
    const form = screen.getByTestId("shipping-form")
    expect(form.getAttribute("autocomplete")).toBe("off")
  })

  it("context setValue calls setValueForm and setAddress when shipToDifferentAddress is true", async () => {
    const setValueForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      values: {},
      errors: {},
    })
    renderForm({}, {}, { shipToDifferentAddress: true })
    const probe = screen.getByTestId("probe")
    await act(async () => {
      probe.click()
    })
    expect(setValueForm).toHaveBeenCalledWith("shipping_address_first_name", "Jane")
    expect(mockSetAddress).toHaveBeenCalledWith(
      expect.objectContaining({ resource: "shipping_address" })
    )
  })

  it("resets form when reset=true and errors are non-empty", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      values: {},
      errors: {
        shipping_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
    })
    renderForm({ reset: true }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith([], "shipping_address")
    })
  })

  it("handles checkbox field type (save to customer address book)", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        shipping_address_save_to_customer_book: { type: "checkbox", checked: true },
      },
    })
    renderForm({}, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "shipping_address",
        value: true,
      })
    })
  })
})
