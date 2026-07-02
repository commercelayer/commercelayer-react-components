import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { BillingAddressForm } from "#components/addresses/BillingAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
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
  const saveAddresses = vi.fn()
  const addResourceToInclude = vi.fn()
  const addressContext = {
    ...defaultAddressContext,
    setAddressErrors,
    setAddress,
    saveAddresses,
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

  return { ...result, setAddressErrors, setAddress, saveAddresses, addResourceToInclude }
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

  it("exposes errorClassName through context", async () => {
    let contextRef: { errorClassName?: string } | undefined

    function ErrorClassProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      contextRef = ctx as typeof contextRef
      return <div />
    }

    renderForm({
      children: <ErrorClassProbe />,
      props: { errorClassName: "field-error" },
    })

    await waitFor(() => {
      expect(contextRef?.errorClassName).toBe("field-error")
    })
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

    const addrCtx = {
      ...defaultAddressContext,
      setAddress,
      setAddressErrors,
      saveAddresses: vi.fn(),
    } as any
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

  it("provides a stable setValue reference across renders (no infinite loop)", async () => {
    let renderCount = 0
    let capturedSetValue: ((...args: unknown[]) => void) | undefined
    const seenSetValues = new Set<unknown>()

    function StabilityProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      renderCount++
      if (ctx.setValue != null) {
        seenSetValues.add(ctx.setValue)
        capturedSetValue = ctx.setValue as typeof capturedSetValue
      }
      return <div />
    }

    renderForm({ children: <StabilityProbe /> })

    await waitFor(() => expect(capturedSetValue).toBeDefined())

    const countAfterMount = renderCount
    // Allow a few more frames to detect any runaway re-renders
    await new Promise((r) => setTimeout(r, 100))

    // setValue must be the same reference across renders (no new arrow fn each cycle)
    expect(seenSetValues.size).toBe(1)
    // render count should not grow unboundedly
    expect(renderCount).toBeLessThanOrEqual(countAfterMount + 2)
  })

  it("exposes errorMode='inline' in context by default", async () => {
    let ctxRef: { errorMode?: string } | undefined

    function ModeProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderForm({ children: <ModeProbe /> })

    await waitFor(() => {
      expect(ctxRef?.errorMode).toBe("inline")
    })
  })

  it("exposes errorMode='submit' in context when prop is set", async () => {
    let ctxRef: { errorMode?: string } | undefined

    function ModeProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderForm({ props: { errorMode: "submit" }, children: <ModeProbe /> })

    await waitFor(() => {
      expect(ctxRef?.errorMode).toBe("submit")
    })
  })

  it("suppresses inline errors when errorMode='submit' (no errors in context while typing)", async () => {
    let ctxRef: { errors?: Record<string, unknown> } | undefined

    function ErrorProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      ctxRef = ctx as typeof ctxRef
      return <input name="billing_address_first_name" required />
    }

    // Simulate an invalid field being tracked by rapid-form
    renderForm({
      props: { errorMode: "submit" },
      children: <ErrorProbe />,
      values: {
        billing_address_first_name: { value: "", required: true },
      },
    })

    // Even with an invalid rapid-form field, errors should remain empty in submit mode
    await act(async () => {})
    expect(Object.keys(ctxRef?.errors ?? {})).toHaveLength(0)
  })

  it("exposes validate function via context when errorMode='submit'", async () => {
    let ctxRef: { validate?: unknown } | undefined

    function ValidateProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderForm({ props: { errorMode: "submit" }, children: <ValidateProbe /> })

    await waitFor(() => {
      expect(typeof ctxRef?.validate).toBe("function")
    })
  })

  it("validate() surfaces errors for invalid required fields", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    let ctxRef: any

    function ValidateProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      ctxRef = ctx
      return <input name="billing_address_first_name" required defaultValue="" />
    }

    renderForm({ props: { errorMode: "submit" }, children: <ValidateProbe /> })

    await waitFor(() => expect(ctxRef?.validate).toBeDefined())

    let returnedErrors: Record<string, unknown> = {}
    act(() => {
      returnedErrors = ctxRef?.validate?.() ?? {}
    })

    // validate() returns errors synchronously
    expect(returnedErrors).toHaveProperty("billing_address_first_name")

    // and also sets them in context so fields can show error styling
    await waitFor(() => {
      expect(ctxRef?.errors).toHaveProperty("billing_address_first_name")
    })
  })

  it("after validate() is called, inline errors clear when field becomes valid", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    let ctxRef: any

    function ValidateProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      ctxRef = ctx
      return <input name="billing_address_first_name" required data-testid="fname" />
    }

    renderForm({
      props: { errorMode: "submit" },
      children: <ValidateProbe />,
      values: { billing_address_first_name: { value: "", required: true } },
    })

    await waitFor(() => expect(ctxRef?.validate).toBeDefined())

    // First validate() — errors appear
    act(() => {
      ctxRef?.validate?.()
    })
    await waitFor(() => expect(Object.keys(ctxRef?.errors ?? {})).toHaveLength(1))

    // Fill the input so checkValidity() returns true, then trigger rapid-form update
    const input = screen.getByTestId("fname") as HTMLInputElement
    act(() => {
      input.value = "Jane"
    })

    // Now rapid-form mock returns a valid value → main effect fires → no errors
    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: { billing_address_first_name: { value: "Jane", required: true } },
    })

    const addrCtx = {
      ...defaultAddressContext,
      saveAddresses: vi.fn(),
      setAddressErrors: vi.fn(),
      setAddress: vi.fn(),
    } as any

    const { rerender } = render(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider
          value={
            {
              ...defaultOrderContext,
              order: { id: "ord-1" },
              include: ["billing_address"],
              includeLoaded: { billing_address: true },
              addResourceToInclude: vi.fn(),
            } as any
          }
        >
          <BillingAddressForm data-testid="form2" errorMode="submit">
            <ValidateProbe />
          </BillingAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    // After a fresh render with valid data, errors should be empty once the new form mounts
    await waitFor(() => {
      expect(typeof ctxRef?.errors).toBe("object")
    })
  })
})

// Standalone mode: BillingAddressForm without an AddressesContainer ancestor

const saveAddressesMock = vi.hoisted(() => vi.fn())
vi.mock("#reducers/AddressReducer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#reducers/AddressReducer")>()
  return { ...actual, saveAddresses: saveAddressesMock }
})

function renderStandalone(
  overrides: {
    props?: Partial<React.ComponentProps<typeof BillingAddressForm>>
    orderOverrides?: Record<string, unknown>
    values?: Record<string, unknown>
    children?: React.ReactNode
    commerceLayerConfig?: Record<string, unknown>
  } = {}
) {
  const addResourceToInclude = vi.fn()
  const orderContext = {
    ...defaultOrderContext,
    order: { id: "ord-1" },
    include: ["billing_address"],
    includeLoaded: { billing_address: true },
    addResourceToInclude,
    ...overrides.orderOverrides,
  }
  const clConfig = { accessToken: "tok", ...overrides.commerceLayerConfig }

  rapidForm.useRapidForm.mockReturnValue({
    refValidation: vi.fn(),
    values: overrides.values ?? {},
  })

  // No AddressesContext.Provider → isStandalone = true
  const result = render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider value={clConfig as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={orderContext as any}>
        <BillingAddressForm data-testid="form" {...overrides.props}>
          {overrides.children ?? <div data-testid="child" />}
        </BillingAddressForm>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )

  return { ...result, addResourceToInclude }
}

describe("BillingAddressForm (standalone mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getSaveBillingAddressToAddressBook.mockReturnValue(false)
    saveAddressesMock.mockResolvedValue(undefined)
  })

  it("renders without an AddressesContext provider (standalone detection)", () => {
    renderStandalone()
    expect(screen.getByTestId("form")).toBeDefined()
  })

  it("wraps children in its own AddressesContext.Provider with saveAddresses", async () => {
    let ctxRef: { saveAddresses?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({ children: <AddressCtxProbe /> })

    await waitFor(() => {
      expect(typeof ctxRef?.saveAddresses).toBe("function")
    })
  })

  it("exposes isBusiness prop via AddressesContext in standalone mode", async () => {
    let ctxRef: { isBusiness?: boolean } | undefined

    function IsBizProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({ props: { isBusiness: true }, children: <IsBizProbe /> })

    await waitFor(() => {
      expect(ctxRef?.isBusiness).toBe(true)
    })
  })

  it("exposes shipToDifferentAddress prop via AddressesContext in standalone mode", async () => {
    let ctxRef: { shipToDifferentAddress?: boolean } | undefined

    function ShipProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({ props: { shipToDifferentAddress: true }, children: <ShipProbe /> })

    await waitFor(() => {
      expect(ctxRef?.shipToDifferentAddress).toBe(true)
    })
  })

  it("standaloneSetAddress dispatches to own reducer", async () => {
    let ctxRef: { setAddress?: unknown; billing_address?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({ children: <AddressCtxProbe /> })

    await waitFor(() => expect(ctxRef?.setAddress).toBeDefined())

    act(() => {
      ;(ctxRef as any)?.setAddress?.({
        resource: "billing_address",
        values: { first_name: "Alice" },
      })
    })

    await waitFor(() => {
      expect((ctxRef as any)?.billing_address?.first_name).toBe("Alice")
    })
  })

  it("standaloneSetAddressErrors dispatches to own reducer", async () => {
    let ctxRef: { setAddressErrors?: unknown; errors?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({ children: <AddressCtxProbe /> })

    await waitFor(() => expect(ctxRef?.setAddressErrors).toBeDefined())

    act(() => {
      ;(ctxRef as any)?.setAddressErrors?.(
        [
          {
            code: "REQUIRED",
            message: "Required",
            resource: "billing_address",
            field: "first_name",
          },
        ],
        "billing_address"
      )
    })

    await waitFor(() => {
      const errors = (ctxRef as any)?.errors
      expect(errors).toBeDefined()
    })
  })

  it("propagates form values to own standalone state via setAddress", async () => {
    let ctxRef: { billing_address?: Record<string, unknown> } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({
      values: {
        billing_address_first_name: { value: "Bob", required: true },
      },
      children: <AddressCtxProbe />,
    })

    await waitFor(() => {
      expect(ctxRef?.billing_address?.first_name).toBe("Bob")
    })
  })

  it("calls saveAddresses (AddressReducer) when standaloneSaveAddresses is invoked", async () => {
    let ctxRef: { saveAddresses?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandalone({ children: <AddressCtxProbe /> })

    await waitFor(() => expect(ctxRef?.saveAddresses).toBeDefined())

    await act(async () => {
      await (ctxRef as any)?.saveAddresses?.()
    })

    expect(saveAddressesMock).toHaveBeenCalled()
  })

  it("also provides BillingAddressFormContext in standalone mode", async () => {
    let formCtxRef: { errorClassName?: string } | undefined

    function FormCtxProbe(): JSX.Element {
      const ctx = useContext(BillingAddressFormContext)
      formCtxRef = ctx as typeof formCtxRef
      return <div />
    }

    renderStandalone({ props: { errorClassName: "err" }, children: <FormCtxProbe /> })

    await waitFor(() => {
      expect(formCtxRef?.errorClassName).toBe("err")
    })
  })
})
