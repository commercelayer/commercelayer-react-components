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

const localStorageMock = vi.hoisted(() => ({
  getSaveBillingAddressToAddressBook: vi.fn(),
}))

vi.mock("#utils/localStorage", () => ({
  getSaveBillingAddressToAddressBook: localStorageMock.getSaveBillingAddressToAddressBook,
  getSaveShippingAddressToAddressBook: vi.fn(),
  setCustomerOrderParam: vi.fn(),
  getLocalOrder: vi.fn(),
  setLocalOrder: vi.fn(),
  deleteLocalOrder: vi.fn(),
}))

function ContextProbe(): JSX.Element {
  const ctx = useContext(BillingAddressFormContext)
  return (
    <div>
      <div data-testid="errors">{JSON.stringify(ctx.errors ?? {})}</div>
      <div data-testid="values">{JSON.stringify(ctx.values ?? {})}</div>
    </div>
  )
}

function renderForm(
  overrides: {
    addressOverrides?: Record<string, unknown>
    orderOverrides?: Record<string, unknown>
    props?: Partial<React.ComponentProps<typeof BillingAddressForm>>
    children?: React.ReactNode
    values?: Record<string, unknown>
  } = {}
) {
  const setAddressErrors = vi.fn()
  const setAddress = vi.fn()
  const addResourceToInclude = vi.fn()
  const addressContext = {
    ...defaultAddressContext,
    setAddressErrors,
    setAddress,
    ...overrides.addressOverrides,
  }
  const orderContext = {
    ...defaultOrderContext,
    order: { id: "ord-1" },
    include: ["billing_address"],
    includeLoaded: { billing_address: true },
    addResourceToInclude,
    ...overrides.orderOverrides,
  }

  rapidForm.useRapidForm.mockReturnValue({
    refValidation: vi.fn(),
    values: overrides.values ?? {},
  })

  const result = render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <AddressesContext.Provider value={addressContext as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={orderContext as any}>
        <BillingAddressForm data-testid="form" {...overrides.props}>
          {overrides.children ?? <ContextProbe />}
        </BillingAddressForm>
      </OrderContext.Provider>
    </AddressesContext.Provider>
  )

  return { ...result, setAddressErrors, setAddress, addResourceToInclude }
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getSaveBillingAddressToAddressBook.mockReturnValue(false)
})

describe("BillingAddressForm", () => {
  it("renders a form with children", () => {
    renderForm()
    expect(screen.getByTestId("form")).toBeDefined()
  })

  it("defaults to autocomplete=on", () => {
    renderForm()
    expect(screen.getByTestId("form").getAttribute("autocomplete")).toBe("on")
  })

  it("passes extra props to the form element", () => {
    renderForm({ props: { className: "my-form" } })
    expect(screen.getByTestId("form").className).toContain("my-form")
  })

  it("propagates valid form values to setAddress", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        billing_address_last_name: { value: "Doe", required: true },
      },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: "billing_address",
          values: expect.objectContaining({
            first_name: "Jane",
            last_name: "Doe",
          }),
        })
      )
    })
  })

  it("does not call setAddress when values are empty", async () => {
    const { setAddress } = renderForm({ values: {} })
    await act(async () => {})
    expect(setAddress).not.toHaveBeenCalled()
  })

  it("includes isBusiness flag in address values", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
      },
      addressOverrides: { isBusiness: true },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({ business: true }),
        })
      )
    })
  })

  it("skips fields with no value when required", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "", required: true },
      },
    })

    await waitFor(() => {
      expect(setAddress).not.toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({ first_name: "" }),
        })
      )
    })
  })

  it("includes optional fields with required=false even when empty", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_company: { value: "", required: false },
        billing_address_first_name: { value: "Jane", required: true },
      },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            company: "",
            first_name: "Jane",
          }),
        })
      )
    })
  })

  it("calls saveAddressToCustomerAddressBook for checkbox fields", async () => {
    const saveAddressToCustomerAddressBook = vi.fn()
    renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        billing_address_save_to_customer_book: {
          value: "on",
          type: "checkbox",
          checked: true,
        },
      },
      orderOverrides: { saveAddressToCustomerAddressBook },
    })

    await waitFor(() => {
      expect(saveAddressToCustomerAddressBook).toHaveBeenCalledWith(
        expect.objectContaining({ type: "billing_address", value: true })
      )
    })
  })

  it("sets address errors when input validation fails", async () => {
    const { setAddressErrors, container } = renderForm({
      children: (
        <>
          <input name="billing_address_first_name" required />
          <ContextProbe />
        </>
      ),
      values: {
        billing_address_first_name: { value: "" },
      },
    })

    const input = container.querySelector<HTMLInputElement>(
      "input[name='billing_address_first_name']"
    )
    if (input != null) {
      input.required = true
      input.setCustomValidity("Required")
    }

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalled()
    })
  })

  it("applies customFieldMessageError (string response)", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        billing_address_first_name: {
          value: "X",
          name: "billing_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: ({ field }) =>
          field === "billing_address_first_name" ? "Too short" : null,
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ message: "Too short", field: "billing_address_first_name" }),
        ]),
        "billing_address"
      )
    })
  })

  it("applies customFieldMessageError (array response with isValid=false)", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        billing_address_first_name: {
          value: "X",
          name: "billing_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: () => [
          { field: "billing_address_first_name", isValid: false, message: "Bad value" },
        ],
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ message: "Bad value" })]),
        "billing_address"
      )
    })
  })

  it("clears errors for field when customFieldMessageError returns isValid=true", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        billing_address_first_name: {
          value: "Jane",
          name: "billing_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: () => [{ field: "billing_address_first_name", isValid: true }],
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "billing_address")
    })
  })

  it("resets form when reset prop is true", async () => {
    const setAddress = vi.fn()
    const setAddressErrors = vi.fn()
    const addResourceToInclude = vi.fn()

    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: { billing_address_first_name: { value: "Jane", required: true } },
    })

    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    const addrCtx = { ...defaultAddressContext, setAddress, setAddressErrors } as any
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    const orderCtx = {
      ...defaultOrderContext,
      order: { id: "ord-1" },
      include: ["billing_address"],
      includeLoaded: { billing_address: true },
      addResourceToInclude,
    } as any

    const { rerender } = render(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider value={orderCtx}>
          <BillingAddressForm data-testid="form" reset={false}>
            <ContextProbe />
          </BillingAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    await waitFor(() => expect(setAddress).toHaveBeenCalled())
    setAddressErrors.mockClear()

    rerender(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider value={orderCtx}>
          <BillingAddressForm data-testid="form" reset={true}>
            <ContextProbe />
          </BillingAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "billing_address")
    })
  })

  it("calls addResourceToInclude when billing_address not in include", async () => {
    const addResourceToInclude = vi.fn()
    renderForm({
      orderOverrides: {
        include: [],
        includeLoaded: {},
        addResourceToInclude,
      },
    })

    await waitFor(() => {
      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({ newResource: "billing_address" })
      )
    })
  })

  it("calls addResourceToInclude to mark billing_address as loaded", async () => {
    const addResourceToInclude = vi.fn()
    renderForm({
      orderOverrides: {
        include: ["billing_address"],
        includeLoaded: { billing_address: false },
        addResourceToInclude,
      },
    })

    await waitFor(() => {
      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({ newResourceLoaded: { billing_address: true } })
      )
    })
  })

  it("provides setValue via context", async () => {
    let contextRef: ReturnType<typeof useContext<typeof BillingAddressFormContext>> | undefined

    function ValueSetter(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      contextRef = ctx as typeof contextRef
      return <input name="billing_address_first_name" data-testid="input" />
    }

    renderForm({ children: <ValueSetter /> })
    await waitFor(() => expect(contextRef).toBeDefined())

    act(() => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      ;(contextRef as any)?.setValue?.("billing_address_first_name", "Updated")
    })

    const input = screen.getByTestId("input") as HTMLInputElement
    expect(input.value).toBe("Updated")
  })

  it("provides resetField via context", async () => {
    let contextRef: ReturnType<typeof useContext<typeof BillingAddressFormContext>> | undefined

    function FieldResetter(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      contextRef = ctx as typeof contextRef
      return <input name="billing_address_first_name" data-testid="input" defaultValue="Jane" />
    }

    renderForm({ children: <FieldResetter /> })
    await waitFor(() => expect(contextRef).toBeDefined())

    act(() => {
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      ;(contextRef as any)?.resetField?.("billing_address_first_name")
    })

    const input = screen.getByTestId("input") as HTMLInputElement
    expect(input.value).toBe("")
  })

  it("provides requiresBillingInfo from order context", async () => {
    let contextRef: { requiresBillingInfo?: boolean } | undefined

    function BillingInfoProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      contextRef = ctx as typeof contextRef
      return <div />
    }

    renderForm({
      children: <BillingInfoProbe />,
      orderOverrides: { order: { id: "ord-1", requires_billing_info: true } },
    })

    await waitFor(() => {
      expect(contextRef?.requiresBillingInfo).toBe(true)
    })
  })

  it("saves address to book when localStorage flag is set", async () => {
    const saveAddressToCustomerAddressBook = vi.fn()
    localStorageMock.getSaveBillingAddressToAddressBook.mockReturnValue(true)

    renderForm({
      orderOverrides: { saveAddressToCustomerAddressBook },
    })

    await waitFor(() => {
      expect(saveAddressToCustomerAddressBook).toHaveBeenCalledWith(
        expect.objectContaining({ type: "billing_address", value: true })
      )
    })
  })

  it("skips null fields in formValues during error collection", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        // biome-ignore lint/suspicious/noExplicitAny: test null field
        billing_address_null_field: null as any,
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "billing_address")
    })
  })

  it("skips fields with null name in customFieldMessageError processing", async () => {
    const customFieldMessageError = vi.fn().mockReturnValue(null)
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", name: null, required: true },
      },
      props: { customFieldMessageError },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalled()
    })
  })

  it("customFieldMessageError returning null skips the field", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: {
          value: "Jane",
          name: "billing_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: () => null,
      },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "billing_address" })
      )
    })
  })
})
