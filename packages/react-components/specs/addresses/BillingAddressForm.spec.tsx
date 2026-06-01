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

const mockGetSaveBillingAddress = vi.hoisted(() => vi.fn().mockReturnValue(false))
vi.mock("#utils/localStorage", () => ({
  getSaveBillingAddressToAddressBook: mockGetSaveBillingAddress,
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

function ResetFieldProbe(): JSX.Element {
  const ctx = useContext(BillingAddressFormContext)
  return (
    <button
      type="button"
      data-testid="reset-probe"
      // biome-ignore lint/suspicious/noExplicitAny: test probe
      onClick={() => (ctx as any).resetField?.("billing_address_first_name")}
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
          <ResetFieldProbe />
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
  mockGetSaveBillingAddress.mockReturnValue(false)
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

  it("calls saveAddressToCustomerAddressBook when checkboxChecked from localStorage", async () => {
    mockGetSaveBillingAddress.mockReturnValue(true)
    rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn, values: {}, errors: {} })
    renderForm()
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "billing_address",
        value: true,
      })
    })
  })

  it("resetField calls resetForm with field name", async () => {
    const resetForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn, reset: resetForm })
    renderForm()
    await act(async () => {
      screen.getByTestId("reset-probe").click()
    })
    expect(resetForm).toHaveBeenCalledWith(
      expect.objectContaining({ currentTarget: expect.anything() }),
      "billing_address_first_name"
    )
  })

  it("customFieldMessageError: returns string for field not in error — calls setErrorForm", async () => {
    const setError = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue("Custom error message")
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: {},
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith(
        expect.objectContaining({ name: "billing_address_first_name", code: "VALIDATION_ERROR" })
      )
    })
  })

  it("customFieldMessageError: returns string for field already in error — updates message", async () => {
    const customFieldMessageError = vi.fn().mockReturnValue("Updated error")
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: "original error" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(customFieldMessageError).toHaveBeenCalled()
      expect(errorsObj.billing_address_first_name.message).toBe("Updated error")
    })
  })

  it("customFieldMessageError: returns array with isValid=false, not in error — calls setErrorForm", async () => {
    const setError = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue([
      {
        field: "billing_address_first_name",
        value: "John",
        isValid: false,
        message: "Bad value",
      },
    ])
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: {},
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith(
        expect.objectContaining({ name: "billing_address_first_name", code: "VALIDATION_ERROR" })
      )
    })
  })

  it("customFieldMessageError: returns array with isValid=true, field in error — deletes error and calls setValue", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "billing_address_first_name", value: "Fixed", isValid: true, message: "" },
      ])
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: "bad" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "Fixed",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(customFieldMessageError).toHaveBeenCalled()
      expect(errorsObj.billing_address_first_name).toBeUndefined()
      expect(setValueForm).toHaveBeenCalledWith("billing_address_first_name", "Fixed")
    })
  })

  it("customFieldMessageError: returns array with isValid=false, field in error, message changed — updates message", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue([
      {
        field: "billing_address_first_name",
        value: "John",
        isValid: false,
        message: "New error",
      },
    ])
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: "Old error" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(customFieldMessageError).toHaveBeenCalled()
      expect(errorsObj.billing_address_first_name.message).toBe("New error")
      expect(setValueForm).toHaveBeenCalledWith("billing_address_first_name", "John")
    })
  })

  it("customFieldMessageError: returns null — skips error processing", async () => {
    const setError = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue(null)
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: {},
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    // customFieldMessageError returned null so no setError should be called
    expect(setError).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: returns string, field in error, same message — no update", async () => {
    const setError = vi.fn()
    const msg = "Same error"
    const customFieldMessageError = vi.fn().mockReturnValue(msg)
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: msg },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    // messages are the same — no update needed
    expect(errorsObj.billing_address_first_name.message).toBe(msg)
  })

  it("customFieldMessageError: returns array with isValid=true, field NOT in error — no action", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "billing_address_first_name", value: "John", isValid: true, message: "" },
      ])
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: {},
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    // isValid=true and field not in error — no setValue should be called
    expect(setValueForm).not.toHaveBeenCalled()
  })

  it("skips field value copy when field.value is empty and field is required", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        billing_address_first_name: {
          value: "",
          required: true,
          type: "text",
        },
      },
    })
    renderForm()
    await waitFor(() => {
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "billing_address" })
      )
    })
  })

  it("includes business flag in address when isBusiness is true", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        billing_address_first_name: {
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({}, {}, { isBusiness: true })
    await waitFor(() => {
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({ business: true }),
        })
      )
    })
  })

  it("handles include already loaded state (include has billing_address AND includeLoaded has it)", async () => {
    rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn, values: {}, errors: {} })
    renderForm({}, { include: ["billing_address"], includeLoaded: { billing_address: true } })
    await act(async () => {})
    // When include already has billing_address AND it's loaded, addResourceToInclude is NOT called
    expect(mockAddResourceToInclude).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: skips field without name property", async () => {
    const setError = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue("Custom error")
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: {},
      values: {
        billing_address_first_name: {
          // no 'name' property — fieldName will be undefined → callback skipped
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    // fieldName is undefined so customFieldMessageError inner block is skipped
    expect(customFieldMessageError).not.toHaveBeenCalled()
    expect(setError).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: array, isValid=false, in error, same message — no update", async () => {
    const setValueForm = vi.fn()
    const msg = "Same error"
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "billing_address_first_name", value: "John", isValid: false, message: msg },
      ])
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: msg },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    // Messages match — no update or setValue
    expect(setValueForm).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: array, isValid=true, in error, value=null — setValueForm called with empty string", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "billing_address_first_name", value: null, isValid: true, message: "" },
      ])
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: "bad" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(setValueForm).toHaveBeenCalledWith("billing_address_first_name", "")
    })
  })

  it("calls setValue with isBusiness flag in address update", async () => {
    rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn, values: {}, errors: {} })
    renderForm({}, {}, { isBusiness: true })
    await act(async () => {
      screen.getByTestId("probe").click()
    })
    expect(mockSetAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ business: true }),
      })
    )
  })

  it("handles reset with non-empty errors (reset block branch with errors)", async () => {
    const resetForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      reset: resetForm,
      values: {},
      errors: {
        billing_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
    })
    renderForm({ reset: true })
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "billing_address",
        value: false,
      })
    })
  })

  it("handles reset without saveAddressToCustomerAddressBook (null path)", async () => {
    const resetForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      reset: resetForm,
      values: {
        billing_address_first_name: { value: "John", required: true, type: "text" },
      },
      errors: {},
    })
    renderForm({ reset: true }, { saveAddressToCustomerAddressBook: undefined })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith([], "billing_address")
    })
  })

  it("handles reset triggered by checkboxChecked (values/errors empty, checkbox=true)", async () => {
    mockGetSaveBillingAddress.mockReturnValue(true)
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      reset: vi.fn(),
      values: {},
      errors: {},
    })
    renderForm({ reset: true })
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "billing_address",
        value: false,
      })
    })
    mockGetSaveBillingAddress.mockReturnValue(false)
  })

  it("uses empty string fallback when error message is undefined", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {
        billing_address_first_name: { code: "VALIDATION_ERROR" }, // no message
      },
      values: {},
    })
    renderForm({})
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ message: "" })]),
        "billing_address"
      )
    })
  })

  it("sets address when field has required=false and no value", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        billing_address_company: { value: "", required: false, type: "text" },
      },
    })
    renderForm({})
    await waitFor(() => {
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "billing_address" })
      )
    })
  })

  it("customFieldMessageError: array, isValid=false, in error, different message, value=null — setValueForm called with empty string", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "billing_address_first_name", value: null, isValid: false, message: "New error" },
      ])
    const errorsObj = {
      billing_address_first_name: { code: "VALIDATION_ERROR", message: "Old error" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        billing_address_first_name: {
          name: "billing_address_first_name",
          value: "John",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(setValueForm).toHaveBeenCalledWith("billing_address_first_name", "")
    })
  })
})
