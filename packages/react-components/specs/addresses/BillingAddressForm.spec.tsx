import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { BillingAddressForm } from "#components/addresses/BillingAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

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
  const ctx = useContext(BillingAddressFormContext)
  return (
    <div
      data-testid="probe"
      data-error-class={ctx.errorClassName ?? ""}
      data-requires-billing={String(ctx.requiresBillingInfo ?? false)}
      // biome-ignore lint/suspicious/noExplicitAny: test probe
      {...({ onClick: () => (ctx as any).setValue?.("billing_address_first_name", "Jane") } as any)}
    />
  )
}

function renderForm(
  formProps: Partial<Parameters<typeof BillingAddressForm>[0]> = {},
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
    order: { id: "ord-1", requires_billing_info: false },
    ...orderOverrides,
  } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const addressCtx = {
    ...defaultAddressContext,
    setAddress: mockSetAddress,
    setAddressErrors: mockSetAddressErrors,
    isBusiness: false,
    ...addressOverrides,
  } as any
  return render(
    <OrderContext.Provider value={orderCtx}>
      <AddressesContext.Provider value={addressCtx}>
        <BillingAddressForm data-testid="billing-form" {...formProps}>
          <ContextProbe />
        </BillingAddressForm>
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

describe("BillingAddressForm", () => {
  it("renders a form element with children", () => {
    renderForm()
    expect(screen.getByTestId("billing-form")).toBeTruthy()
    expect(screen.getByTestId("probe")).toBeTruthy()
  })

  it("calls addResourceToInclude for billing_address on mount", async () => {
    renderForm()
    await waitFor(() => {
      expect(mockAddResourceToInclude).toHaveBeenCalledWith({
        newResource: "billing_address",
      })
    })
  })

  it("calls addResourceToInclude with newResourceLoaded when already included", async () => {
    renderForm({}, { include: ["billing_address"], includeLoaded: {} })
    await waitFor(() => {
      expect(mockAddResourceToInclude).toHaveBeenCalledWith({
        newResourceLoaded: { billing_address: true },
      })
    })
  })

  it("exposes errorClassName through context", () => {
    renderForm({ errorClassName: "field-error" })
    expect(screen.getByTestId("probe").getAttribute("data-error-class")).toBe("field-error")
  })

  it("exposes requiresBillingInfo from order context", () => {
    renderForm({}, { order: { id: "ord-1", requires_billing_info: true } })
    expect(screen.getByTestId("probe").getAttribute("data-requires-billing")).toBe("true")
  })

  it("calls setAddressErrors when form has errors", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {
        billing_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
    })
    renderForm()
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            resource: "billing_address",
            field: "billing_address_first_name",
          }),
        ]),
        "billing_address"
      )
    })
  })

  it("calls setAddress and clears errors when form has valid values", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        billing_address_first_name: { value: "John", required: true, type: "text" },
      },
    })
    renderForm()
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith([], "billing_address")
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "billing_address" })
      )
    })
  })

  it("accepts autoComplete and forwarded props", () => {
    renderForm({ autoComplete: "off" })
    const form = screen.getByTestId("billing-form")
    expect(form.getAttribute("autocomplete")).toBe("off")
  })

  it("context setValue calls setValueForm and setAddress", async () => {
    const setValueForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      values: {},
      errors: {},
    })
    renderForm()
    const probe = screen.getByTestId("probe")
    await act(async () => {
      probe.click()
    })
    expect(setValueForm).toHaveBeenCalledWith("billing_address_first_name", "Jane")
    expect(mockSetAddress).toHaveBeenCalledWith(
      expect.objectContaining({ resource: "billing_address" })
    )
  })

  it("resets form when reset=true and values are non-empty", async () => {
    const resetForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      reset: resetForm,
      values: {
        billing_address_first_name: { value: "John", required: true, type: "text" },
      },
      errors: {},
    })
    renderForm({ reset: true })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith([], "billing_address")
    })
  })

  it("handles checkbox field type (save to customer address book)", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        billing_address_save_to_customer_book: { type: "checkbox", checked: true },
      },
    })
    renderForm()
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "billing_address",
        value: true,
      })
    })
  })
})
