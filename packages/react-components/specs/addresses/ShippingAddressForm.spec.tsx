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

const mockGetSaveShippingAddress = vi.hoisted(() => vi.fn().mockReturnValue(false))
vi.mock("#utils/localStorage", () => ({
  getSaveShippingAddressToAddressBook: mockGetSaveShippingAddress,
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

function ResetFieldProbe(): JSX.Element {
  const ctx = useContext(ShippingAddressFormContext)
  return (
    <button
      type="button"
      data-testid="reset-probe"
      // biome-ignore lint/suspicious/noExplicitAny: test probe
      onClick={() => (ctx as any).resetField?.("shipping_address_first_name")}
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
          <ResetFieldProbe />
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
  mockGetSaveShippingAddress.mockReturnValue(false)
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

  it("marks checkbox as checked when checkboxChecked from localStorage", async () => {
    mockGetSaveShippingAddress.mockReturnValue(true)
    rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn, values: {}, errors: {} })
    renderForm({}, {}, { shipToDifferentAddress: true })
    // checkboxChecked from localStorage triggers the setAttribute block (line 181)
    await act(async () => {})
    expect(mockGetSaveShippingAddress).toHaveBeenCalled()
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
      "shipping_address_first_name"
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
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith(
        expect.objectContaining({ name: "shipping_address_first_name", code: "VALIDATION_ERROR" })
      )
    })
  })

  it("customFieldMessageError: returns string for field already in error — updates message", async () => {
    const customFieldMessageError = vi.fn().mockReturnValue("Updated error")
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: "original error" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(customFieldMessageError).toHaveBeenCalled()
      expect(errorsObj.shipping_address_first_name.message).toBe("Updated error")
    })
  })

  it("customFieldMessageError: returns array with isValid=false — calls setErrorForm", async () => {
    const setError = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue([
      {
        field: "shipping_address_first_name",
        value: "Jane",
        isValid: false,
        message: "Bad value",
      },
    ])
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: {},
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith(
        expect.objectContaining({ name: "shipping_address_first_name", code: "VALIDATION_ERROR" })
      )
    })
  })

  it("customFieldMessageError: returns array with isValid=true, in error — deletes error and setValue", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "shipping_address_first_name", value: "Fixed", isValid: true, message: "" },
      ])
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: "bad" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Fixed",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(customFieldMessageError).toHaveBeenCalled()
      expect(errorsObj.shipping_address_first_name).toBeUndefined()
      expect(setValueForm).toHaveBeenCalledWith("shipping_address_first_name", "Fixed")
    })
  })

  it("customFieldMessageError: returns array with isValid=false, field in error, message changed — updates message", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi.fn().mockReturnValue([
      {
        field: "shipping_address_first_name",
        value: "Jane",
        isValid: false,
        message: "New error",
      },
    ])
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: "Old error" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(customFieldMessageError).toHaveBeenCalled()
      expect(errorsObj.shipping_address_first_name.message).toBe("New error")
      expect(setValueForm).toHaveBeenCalledWith("shipping_address_first_name", "Jane")
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
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    expect(setError).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: returns string, field in error, same message — no update", async () => {
    const setError = vi.fn()
    const msg = "Same error"
    const customFieldMessageError = vi.fn().mockReturnValue(msg)
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: msg },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setError,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    expect(errorsObj.shipping_address_first_name.message).toBe(msg)
  })

  it("customFieldMessageError: returns array with isValid=true, field NOT in error — no action", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "shipping_address_first_name", value: "Jane", isValid: true, message: "" },
      ])
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: {},
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    expect(setValueForm).not.toHaveBeenCalled()
  })

  it("skips field value copy when field.value is empty and field is required", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        shipping_address_first_name: {
          value: "",
          required: true,
          type: "text",
        },
      },
    })
    renderForm()
    await waitFor(() => {
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "shipping_address" })
      )
    })
  })

  it("includes business flag in address when isBusiness is true", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        shipping_address_first_name: {
          value: "Jane",
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

  it("handles include already loaded state", async () => {
    rapidForm.useRapidForm.mockReturnValue({ ...defaultRapidFormReturn, values: {}, errors: {} })
    renderForm({}, { include: ["shipping_address"], includeLoaded: { shipping_address: true } })
    await act(async () => {})
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
        shipping_address_first_name: {
          // no 'name' property
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    expect(customFieldMessageError).not.toHaveBeenCalled()
    expect(setError).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: array, isValid=false, in error, same message — no update", async () => {
    const setValueForm = vi.fn()
    const msg = "Same error"
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "shipping_address_first_name", value: "Jane", isValid: false, message: msg },
      ])
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: msg },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await act(async () => {})
    expect(setValueForm).not.toHaveBeenCalled()
  })

  it("customFieldMessageError: array, isValid=true, in error, value=null — setValueForm called with empty string", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "shipping_address_first_name", value: null, isValid: true, message: "" },
      ])
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: "bad" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(setValueForm).toHaveBeenCalledWith("shipping_address_first_name", "")
    })
  })

  it("sets address errors when invertAddresses=true covers right side of || operator", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {
        shipping_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
      values: {},
    })
    renderForm({}, {}, { shipToDifferentAddress: false, invertAddresses: true })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ resource: "shipping_address" })]),
        "shipping_address"
      )
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

  it("handles reset with non-empty errors", async () => {
    const resetForm = vi.fn()
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      reset: resetForm,
      values: {},
      errors: {
        shipping_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
    })
    renderForm({ reset: true }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "shipping_address",
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
        shipping_address_first_name: { value: "Jane", required: true, type: "text" },
      },
      errors: {},
    })
    renderForm(
      { reset: true },
      { saveAddressToCustomerAddressBook: undefined },
      { shipToDifferentAddress: true }
    )
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith([], "shipping_address")
    })
  })

  it("handles reset triggered by checkboxChecked (values/errors empty, checkbox=true)", async () => {
    mockGetSaveShippingAddress.mockReturnValue(true)
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      reset: vi.fn(),
      values: {},
      errors: {},
    })
    renderForm({ reset: true }, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSaveAddressToCustomerAddressBook).toHaveBeenCalledWith({
        type: "shipping_address",
        value: false,
      })
    })
    mockGetSaveShippingAddress.mockReturnValue(false)
  })

  it("uses empty string fallback when error message is undefined", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {
        shipping_address_first_name: { code: "VALIDATION_ERROR" }, // no message
      },
      values: {},
    })
    renderForm({}, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSetAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ message: "" })]),
        "shipping_address"
      )
    })
  })

  it("skips setAddressErrors when shipToDifferentAddress and invertAddresses are both false", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {
        shipping_address_first_name: { code: "VALIDATION_ERROR", message: "required" },
      },
      values: {},
    })
    renderForm({}, {}, { shipToDifferentAddress: false, invertAddresses: false })
    await act(async () => {})
    expect(mockSetAddressErrors).not.toHaveBeenCalled()
  })

  it("sets address when field has required=false and no value", async () => {
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      errors: {},
      values: {
        shipping_address_company: { value: "", required: false, type: "text" },
      },
    })
    renderForm({}, {}, { shipToDifferentAddress: true })
    await waitFor(() => {
      expect(mockSetAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "shipping_address" })
      )
    })
  })

  it("customFieldMessageError: array, isValid=false, in error, different message, value=null — setValueForm called with empty string", async () => {
    const setValueForm = vi.fn()
    const customFieldMessageError = vi
      .fn()
      .mockReturnValue([
        { field: "shipping_address_first_name", value: null, isValid: false, message: "New error" },
      ])
    const errorsObj = {
      shipping_address_first_name: { code: "VALIDATION_ERROR", message: "Old error" },
    }
    rapidForm.useRapidForm.mockReturnValue({
      ...defaultRapidFormReturn,
      setValue: setValueForm,
      errors: errorsObj,
      values: {
        shipping_address_first_name: {
          name: "shipping_address_first_name",
          value: "Jane",
          required: true,
          type: "text",
        },
      },
    })
    renderForm({ customFieldMessageError })
    await waitFor(() => {
      expect(setValueForm).toHaveBeenCalledWith("shipping_address_first_name", "")
    })
  })
})
