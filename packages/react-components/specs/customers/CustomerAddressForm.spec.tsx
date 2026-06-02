import { act, render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { CustomerAddressForm } from "#components/customers/CustomerAddressForm"
import AddressesContext, { defaultAddressContext } from "#context/AddressContext"
import CustomerAddressFormContext from "#context/CustomerAddressFormContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

const rapidForm = vi.hoisted(() => ({
  useRapidForm: vi.fn(),
}))

vi.mock("rapid-form", () => ({
  useRapidForm: rapidForm.useRapidForm,
}))

function ContextProbe(): JSX.Element {
  const { errors, values } = useContext(CustomerAddressFormContext)
  return (
    <div>
      <div data-testid="errors">{JSON.stringify(errors ?? {})}</div>
      <div data-testid="values">{JSON.stringify(values ?? {})}</div>
    </div>
  )
}

function renderForm(
  overrides: {
    addressOverrides?: Record<string, unknown>
    orderOverrides?: Record<string, unknown>
    props?: Partial<React.ComponentProps<typeof CustomerAddressForm>>
    children?: React.ReactNode
    values?: Record<string, unknown>
  } = {}
) {
  const setAddressErrors = vi.fn()
  const setAddress = vi.fn()
  const addressContext = {
    ...defaultAddressContext,
    setAddressErrors,
    setAddress,
    ...overrides.addressOverrides,
  }
  const orderContext = {
    ...defaultOrderContext,
    order: { id: "ord-1" },
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
        <CustomerAddressForm data-testid="form" {...overrides.props}>
          {overrides.children ?? <ContextProbe />}
        </CustomerAddressForm>
      </OrderContext.Provider>
    </AddressesContext.Provider>
  )

  return { ...result, setAddressErrors, setAddress }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("CustomerAddressForm", () => {
  it("renders a form with children", () => {
    renderForm()
    expect(screen.getByTestId("form")).toBeDefined()
  })

  it("defaults to autocomplete=on", () => {
    renderForm()
    const form = screen.getByTestId("form")
    expect(form.getAttribute("autocomplete")).toBe("on")
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

  it("skips fields with no value when not required=false", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "", required: true },
      },
    })

    await waitFor(() => {
      // Only fields with valid values should be in the address
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

  it("skips checkbox fields", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        billing_address_save_to_book: { value: "on", type: "checkbox" },
      },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.not.objectContaining({ save_to_book: expect.anything() }),
        })
      )
    })
  })

  it("sets address errors when validation fails", async () => {
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

    // Simulate invalid input by setting it to required and empty
    const input = container.querySelector<HTMLInputElement>(
      "input[name='billing_address_first_name']"
    )
    if (input != null) {
      input.required = true
      input.setCustomValidity("This field is required")
    }

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalled()
    })
  })

  it("resets form when reset prop is true", async () => {
    const setAddress = vi.fn()
    const setAddressErrors = vi.fn()

    rapidForm.useRapidForm.mockReturnValue({
      refValidation: vi.fn(),
      values: { billing_address_first_name: { value: "Jane", required: true } },
    })

    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    const addrCtx = { ...defaultAddressContext, setAddress, setAddressErrors } as any
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    const orderCtx = { ...defaultOrderContext, order: { id: "ord-1" } } as any

    const { rerender } = render(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider value={orderCtx}>
          <CustomerAddressForm data-testid="form" reset={false}>
            <ContextProbe />
          </CustomerAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    await waitFor(() => expect(setAddress).toHaveBeenCalled())
    setAddressErrors.mockClear()

    rerender(
      <AddressesContext.Provider value={addrCtx}>
        <OrderContext.Provider value={orderCtx}>
          <CustomerAddressForm data-testid="form" reset={true}>
            <ContextProbe />
          </CustomerAddressForm>
        </OrderContext.Provider>
      </AddressesContext.Provider>
    )

    await waitFor(
      () => {
        expect(setAddressErrors).toHaveBeenCalledWith([], "billing_address")
      },
      { timeout: 2000 }
    )
  })

  it("provides setValue via context", async () => {
    let contextRef: { setValue?: (name: string, value: string) => void } | undefined

    function ValueSetter(): JSX.Element {
      const ctx = useContext(CustomerAddressFormContext)
      contextRef = ctx
      return <input name="billing_address_first_name" data-testid="input" />
    }

    renderForm({ children: <ValueSetter /> })

    await waitFor(() => expect(contextRef).toBeDefined())

    act(() => {
      contextRef?.setValue?.("billing_address_first_name", "Updated")
    })

    const input = screen.getByTestId("input") as HTMLInputElement
    expect(input.value).toBe("Updated")
  })

  it("provides resetField via context", async () => {
    let contextRef: { resetField?: (name: string) => void } | undefined

    function FieldResetter(): JSX.Element {
      const ctx = useContext(CustomerAddressFormContext)
      contextRef = ctx
      return <input name="billing_address_first_name" data-testid="input" defaultValue="Jane" />
    }

    renderForm({ children: <FieldResetter /> })
    await waitFor(() => expect(contextRef).toBeDefined())

    act(() => {
      contextRef?.resetField?.("billing_address_first_name")
    })

    const input = screen.getByTestId("input") as HTMLInputElement
    expect(input.value).toBe("")
  })

  it("provides requiresBillingInfo from order context", async () => {
    let contextRef: { requiresBillingInfo?: boolean } | undefined

    function BillingInfoProbe(): JSX.Element {
      const ctx = useContext(CustomerAddressFormContext)
      contextRef = ctx
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

  it("skips state_code validation when country has no predefined states", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        billing_address_country_code: { value: "IT", required: true },
        billing_address_state_code: { value: "", required: false },
      },
      props: { countriesWithPredefinedStateOptions: [] },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalled()
    })
  })

  it("skips state_code validation error when country has no predefined states (DOM path)", async () => {
    const { setAddressErrors } = renderForm({
      children: (
        <>
          {/* required + empty value → validity.valid = false in jsdom */}
          <input name="billing_address_state_code" required defaultValue="" />
          <input name="billing_address_country_code" />
          <ContextProbe />
        </>
      ),
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        billing_address_country_code: { value: "IT" },
        // IT not in ["US"] → isEmptyStates returns true → state_code error skipped
        billing_address_state_code: { value: "" },
      },
      props: { countriesWithPredefinedStateOptions: ["US"] },
    })

    await waitFor(() => {
      expect(setAddressErrors).toHaveBeenCalledWith([], "billing_address")
    })
  })

  it("skips null fields in formValues during address building", async () => {
    const { setAddress } = renderForm({
      values: {
        billing_address_first_name: { value: "Jane", required: true },
        // biome-ignore lint/suspicious/noExplicitAny: test null field
        billing_address_null_field: null as any,
      },
    })

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: "billing_address",
          values: expect.objectContaining({ first_name: "Jane" }),
        })
      )
    })
  })
})
