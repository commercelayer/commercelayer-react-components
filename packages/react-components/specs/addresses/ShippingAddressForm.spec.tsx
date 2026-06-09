import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { ShippingAddressForm } from "#components/addresses/ShippingAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

const rapidForm = vi.hoisted(() => ({
  useRapidForm: vi.fn(),
}))

vi.mock("rapid-form", () => ({
  useRapidForm: rapidForm.useRapidForm,
}))

const localStorageMock = vi.hoisted(() => ({
  getSaveShippingAddressToAddressBook: vi.fn(),
}))

vi.mock("#utils/localStorage", () => ({
  getSaveBillingAddressToAddressBook: vi.fn(),
  getSaveShippingAddressToAddressBook: localStorageMock.getSaveShippingAddressToAddressBook,
  setCustomerOrderParam: vi.fn(),
  getLocalOrder: vi.fn(),
  setLocalOrder: vi.fn(),
  deleteLocalOrder: vi.fn(),
}))

function ContextProbe(): JSX.Element {
  const ctx = useContext(ShippingAddressFormContext)
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
    props?: Partial<React.ComponentProps<typeof ShippingAddressForm>>
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
    shipToDifferentAddress: true,
    ...overrides.addressOverrides,
  }
  const orderContext = {
    ...defaultOrderContext,
    include: ["shipping_address"],
    includeLoaded: { shipping_address: true },
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
        <ShippingAddressForm data-testid="form" {...overrides.props}>
          {overrides.children ?? <ContextProbe />}
        </ShippingAddressForm>
      </OrderContext.Provider>
    </AddressesContext.Provider>
  )

  return { ...result, setAddressErrors, setAddress, saveAddresses, addResourceToInclude }
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getSaveShippingAddressToAddressBook.mockReturnValue(false)
})

describe("ShippingAddressForm", () => {
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
      const ctx = useContext(ShippingAddressFormContext)
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

  it("propagates valid form values to setAddress when shipToDifferentAddress=true", async () => {
    const { setAddress } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
        shipping_address_last_name: { value: "Doe", required: true },
      },
      addressOverrides: { shipToDifferentAddress: true },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: "shipping_address",
          values: expect.objectContaining({
            first_name: "Jane",
            last_name: "Doe",
          }),
        })
      )
    })
  })

  it("propagates valid form values to setAddress when invertAddresses=true", async () => {
    const { setAddress } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
      },
      addressOverrides: { shipToDifferentAddress: false, invertAddresses: true },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "shipping_address" })
      )
    })
  })

  it("does NOT call setAddress when shouldSyncShippingAddress=false", async () => {
    const { setAddress } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
      },
      addressOverrides: { shipToDifferentAddress: false, invertAddresses: false },
    })

    await act(async () => {})
    expect(setAddress).not.toHaveBeenCalled()
  })

  it("does not call setAddress when values are empty", async () => {
    const { setAddress } = renderForm({ values: {} })
    await act(async () => {})
    expect(setAddress).not.toHaveBeenCalled()
  })

  it("skips fields with no value when required", async () => {
    const { setAddress } = renderForm({
      values: {
        shipping_address_first_name: { value: "", required: true },
      },
    })

    await act(async () => {})
    expect(setAddress).not.toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ first_name: "" }),
      })
    )
  })

  it("includes optional fields with required=false even when empty", async () => {
    const { setAddress } = renderForm({
      values: {
        shipping_address_company: { value: "", required: false },
        shipping_address_first_name: { value: "Jane", required: true },
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

  it("includes isBusiness flag in address values", async () => {
    const { setAddress } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
      },
      addressOverrides: { isBusiness: true, shipToDifferentAddress: true },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({ business: true }),
        })
      )
    })
  })

  it("calls saveAddressToCustomerAddressBook for checkbox fields", async () => {
    const saveAddressToCustomerAddressBook = vi.fn()
    renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
        shipping_address_save_to_customer_book: {
          value: "on",
          type: "checkbox",
          checked: true,
        },
      },
      orderOverrides: { saveAddressToCustomerAddressBook },
    })

    await waitFor(() => {
      expect(saveAddressToCustomerAddressBook).toHaveBeenCalledWith(
        expect.objectContaining({ type: "shipping_address", value: true })
      )
    })
  })

  it("sets address errors when input validation fails (with shouldSyncShippingAddress)", async () => {
    const { setAddressErrors, container } = renderForm({
      children: (
        <>
          <input name="shipping_address_first_name" required />
          <ContextProbe />
        </>
      ),
      values: {
        shipping_address_first_name: { value: "" },
      },
      addressOverrides: { shipToDifferentAddress: true },
    })

    const input = container.querySelector<HTMLInputElement>(
      "input[name='shipping_address_first_name']"
    )
    if (input != null) {
      input.required = true
      input.setCustomValidity("Required")
    }

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalled()
    })
  })

  it("does not set address errors when shouldSyncShippingAddress=false", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
      },
      addressOverrides: { shipToDifferentAddress: false, invertAddresses: false },
    })

    await act(async () => {})
    expect(setAddressErrors).not.toHaveBeenCalledWith(expect.anything(), "shipping_address")
  })

  it("applies customFieldMessageError (string response)", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        shipping_address_first_name: {
          value: "X",
          name: "shipping_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: ({ field }) =>
          field === "shipping_address_first_name" ? "Too short" : null,
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ message: "Too short" })]),
        "shipping_address"
      )
    })
  })

  it("applies customFieldMessageError (array response with isValid=false)", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        shipping_address_first_name: {
          value: "X",
          name: "shipping_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: () => [
          { field: "shipping_address_first_name", isValid: false, message: "Bad" },
        ],
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ message: "Bad" })]),
        "shipping_address"
      )
    })
  })

  it("clears errors for field when customFieldMessageError returns isValid=true", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        shipping_address_first_name: {
          value: "Jane",
          name: "shipping_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: () => [{ field: "shipping_address_first_name", isValid: true }],
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "shipping_address")
    })
  })

  it("resets form when reset prop is true", async () => {
    const setAddress = vi.fn()
    const setAddressErrors = vi.fn()
    const addResourceToInclude = vi.fn()

    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: { shipping_address_first_name: { value: "Jane", required: true } },
    })

    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    const addrCtx = {
      ...defaultAddressContext,
      setAddress,
      setAddressErrors,
      saveAddresses: vi.fn(),
      shipToDifferentAddress: true,
    } as any
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    const orderCtx = {
      ...defaultOrderContext,
      include: ["shipping_address"],
      includeLoaded: { shipping_address: true },
      addResourceToInclude,
    } as any

    const { rerender } = render(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider value={orderCtx}>
          <ShippingAddressForm data-testid="form" reset={false}>
            <ContextProbe />
          </ShippingAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    await waitFor(() => expect(setAddress).toHaveBeenCalled())
    setAddressErrors.mockClear()

    rerender(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider value={orderCtx}>
          <ShippingAddressForm data-testid="form" reset={true}>
            <ContextProbe />
          </ShippingAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "shipping_address")
    })
  })

  it("calls addResourceToInclude when shipping_address not in include", async () => {
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
        expect.objectContaining({ newResource: "shipping_address" })
      )
    })
  })

  it("calls addResourceToInclude to mark shipping_address as loaded", async () => {
    const addResourceToInclude = vi.fn()
    renderForm({
      orderOverrides: {
        include: ["shipping_address"],
        includeLoaded: { shipping_address: false },
        addResourceToInclude,
      },
    })

    await waitFor(() => {
      expect(addResourceToInclude).toHaveBeenCalledWith(
        expect.objectContaining({ newResourceLoaded: { shipping_address: true } })
      )
    })
  })

  it("provides setValue via context", async () => {
    let contextRef: { setValue?: (name: string, value: string) => void } | undefined

    function ValueSetter(): JSX.Element {
      const ctx = useContext(ShippingAddressFormContext)
      contextRef = ctx as typeof contextRef
      return <input name="shipping_address_first_name" data-testid="input" />
    }

    renderForm({ children: <ValueSetter /> })
    await waitFor(() => expect(contextRef).toBeDefined())

    act(() => {
      contextRef?.setValue?.("shipping_address_first_name", "Updated")
    })

    const input = screen.getByTestId("input") as HTMLInputElement
    expect(input.value).toBe("Updated")
  })

  it("provides resetField via context", async () => {
    let contextRef: { resetField?: (name: string) => void } | undefined

    function FieldResetter(): JSX.Element {
      const ctx = useContext(ShippingAddressFormContext)
      contextRef = ctx as typeof contextRef
      return <input name="shipping_address_first_name" data-testid="input" defaultValue="Jane" />
    }

    renderForm({ children: <FieldResetter /> })
    await waitFor(() => expect(contextRef).toBeDefined())

    act(() => {
      contextRef?.resetField?.("shipping_address_first_name")
    })

    const input = screen.getByTestId("input") as HTMLInputElement
    expect(input.value).toBe("")
  })

  it("saves address to book when localStorage flag is set", async () => {
    const saveAddressToCustomerAddressBook = vi.fn()
    localStorageMock.getSaveShippingAddressToAddressBook.mockReturnValue(true)

    renderForm({
      orderOverrides: { saveAddressToCustomerAddressBook },
    })

    await waitFor(() => {
      expect(saveAddressToCustomerAddressBook).toHaveBeenCalledWith(
        expect.objectContaining({ type: "shipping_address", value: true })
      )
    })
  })

  it("skips null fields in formValues during error collection", async () => {
    const { setAddressErrors } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
        // biome-ignore lint/suspicious/noExplicitAny: test null field
        shipping_address_null_field: null as any,
      },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "shipping_address")
    })
  })

  it("skips fields with null name in customFieldMessageError processing", async () => {
    const customFieldMessageError = vi.fn().mockReturnValue(null)
    const { setAddress } = renderForm({
      values: {
        shipping_address_first_name: { value: "Jane", name: null, required: true },
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
        shipping_address_first_name: {
          value: "Jane",
          name: "shipping_address_first_name",
          required: true,
        },
      },
      props: {
        customFieldMessageError: () => null,
      },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "shipping_address" })
      )
    })
  })

  it("uses shipToDifferentAddress_prop as fallback when parentAddressContext.shipToDifferentAddress is undefined", async () => {
    // Covers line 59: parentAddressContext.shipToDifferentAddress ?? shipToDifferentAddress_prop
    // When the context value is undefined, the prop default (true) should be used.
    const { setAddress } = renderForm({
      addressOverrides: { shipToDifferentAddress: undefined },
      values: {
        shipping_address_first_name: { value: "Jane", required: true },
      },
    })

    // shipToDifferentAddress_prop defaults to true → shouldSync=true → setAddress called
    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({ resource: "shipping_address" })
      )
    })
  })
})

// Standalone mode: ShippingAddressForm without an AddressesContainer ancestor

const saveAddressesMock = vi.hoisted(() => vi.fn())
vi.mock("#reducers/AddressReducer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#reducers/AddressReducer")>()
  return { ...actual, saveAddresses: saveAddressesMock }
})

function renderStandaloneShipping(
  overrides: {
    props?: Partial<React.ComponentProps<typeof ShippingAddressForm>>
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
    include: ["shipping_address"],
    includeLoaded: { shipping_address: true },
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
        <ShippingAddressForm data-testid="form" {...overrides.props}>
          {overrides.children ?? <div data-testid="child" />}
        </ShippingAddressForm>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )

  return { ...result, addResourceToInclude }
}

describe("ShippingAddressForm (standalone mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getSaveShippingAddressToAddressBook.mockReturnValue(false)
    saveAddressesMock.mockResolvedValue(undefined)
  })

  it("renders without an AddressesContext provider (standalone detection)", () => {
    renderStandaloneShipping()
    expect(screen.getByTestId("form")).toBeDefined()
  })

  it("wraps children in its own AddressesContext.Provider with saveAddresses", async () => {
    let ctxRef: { saveAddresses?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({ children: <AddressCtxProbe /> })

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

    renderStandaloneShipping({ props: { isBusiness: true }, children: <IsBizProbe /> })

    await waitFor(() => {
      expect(ctxRef?.isBusiness).toBe(true)
    })
  })

  it("exposes shipToDifferentAddress=true by default via AddressesContext in standalone mode", async () => {
    let ctxRef: { shipToDifferentAddress?: boolean } | undefined

    function ShipProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({ children: <ShipProbe /> })

    await waitFor(() => {
      expect(ctxRef?.shipToDifferentAddress).toBe(true)
    })
  })

  it("exposes shipToDifferentAddress=false when prop is false", async () => {
    let ctxRef: { shipToDifferentAddress?: boolean } | undefined

    function ShipProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({ props: { shipToDifferentAddress: false }, children: <ShipProbe /> })

    await waitFor(() => {
      expect(ctxRef?.shipToDifferentAddress).toBe(false)
    })
  })

  it("standaloneSetAddress dispatches to own reducer", async () => {
    let ctxRef: { setAddress?: unknown; shipping_address?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({ children: <AddressCtxProbe /> })

    await waitFor(() => expect(ctxRef?.setAddress).toBeDefined())

    act(() => {
      ;(ctxRef as any)?.setAddress?.({
        resource: "shipping_address",
        values: { first_name: "Alice" },
      })
    })

    await waitFor(() => {
      expect((ctxRef as any)?.shipping_address?.first_name).toBe("Alice")
    })
  })

  it("standaloneSetAddressErrors dispatches to own reducer", async () => {
    let ctxRef: { setAddressErrors?: unknown; errors?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({ children: <AddressCtxProbe /> })

    await waitFor(() => expect(ctxRef?.setAddressErrors).toBeDefined())

    act(() => {
      ;(ctxRef as any)?.setAddressErrors?.(
        [{ code: "REQUIRED", message: "Required", resource: "shipping_address", field: "first_name" }],
        "shipping_address"
      )
    })

    await waitFor(() => {
      const errors = (ctxRef as any)?.errors
      expect(errors).toBeDefined()
    })
  })

  it("propagates form values to own standalone state via setAddress", async () => {
    let ctxRef: { shipping_address?: Record<string, unknown> } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({
      values: {
        shipping_address_first_name: { value: "Bob", required: true },
      },
      children: <AddressCtxProbe />,
    })

    await waitFor(() => {
      expect(ctxRef?.shipping_address?.first_name).toBe("Bob")
    })
  })

  it("calls saveAddresses (AddressReducer) when standaloneSaveAddresses is invoked", async () => {
    let ctxRef: { saveAddresses?: unknown } | undefined

    function AddressCtxProbe(): JSX.Element {
      const ctx = useContext(AddressesContext)
      ctxRef = ctx as typeof ctxRef
      return <div />
    }

    renderStandaloneShipping({ children: <AddressCtxProbe /> })

    await waitFor(() => expect(ctxRef?.saveAddresses).toBeDefined())

    await act(async () => {
      await (ctxRef as any)?.saveAddresses?.()
    })

    expect(saveAddressesMock).toHaveBeenCalled()
  })

  it("also provides ShippingAddressFormContext in standalone mode", async () => {
    let formCtxRef: { errorClassName?: string } | undefined

    function FormCtxProbe(): JSX.Element {
      const ctx = useContext(ShippingAddressFormContext)
      formCtxRef = ctx as typeof formCtxRef
      return <div />
    }

    renderStandaloneShipping({ props: { errorClassName: "err" }, children: <FormCtxProbe /> })

    await waitFor(() => {
      expect(formCtxRef?.errorClassName).toBe("err")
    })
  })
})
