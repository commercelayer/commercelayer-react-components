import { act, render, screen } from "@testing-library/react"
import AddressInput from "#components/addresses/AddressInput"
import type { DefaultContextAddress } from "#context/BillingAddressFormContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CustomerAddressFormContext from "#context/CustomerAddressFormContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

vi.mock("@commercelayer/core", () => ({}))

const makeBillingCtx = (overrides: Partial<DefaultContextAddress> = {}): DefaultContextAddress =>
  ({
    setValue: vi.fn(),
    errors: {},
    errorClassName: "field-error",
    isBusiness: false,
    requiresBillingInfo: undefined,
    ...overrides,
  }) as unknown as DefaultContextAddress

const makeShippingCtx = (overrides: Partial<DefaultContextAddress> = {}): DefaultContextAddress =>
  ({
    setValue: vi.fn(),
    errors: {},
    errorClassName: "field-error",
    isBusiness: false,
    requiresBillingInfo: undefined,
    ...overrides,
  }) as unknown as DefaultContextAddress

const makeCustomerCtx = (overrides: Partial<DefaultContextAddress> = {}): DefaultContextAddress =>
  ({
    setValue: vi.fn(),
    errors: {},
    ...overrides,
  }) as unknown as DefaultContextAddress

function renderInput(
  props: Partial<Parameters<typeof AddressInput>[0]> & { name?: any } = {},
  billingOverride: Partial<DefaultContextAddress> = {},
  shippingOverride: Partial<DefaultContextAddress> = {},
  customerOverride: Partial<DefaultContextAddress> = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const billingCtx = makeBillingCtx(billingOverride) as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const shippingCtx = makeShippingCtx(shippingOverride) as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const customerCtx = makeCustomerCtx(customerOverride) as any
  return render(
    <BillingAddressFormContext.Provider value={billingCtx}>
      <ShippingAddressFormContext.Provider value={shippingCtx}>
        <CustomerAddressFormContext.Provider value={customerCtx}>
          <AddressInput
            name={"billing_address_first_name" as any}
            placeholder="First name"
            {...props}
          />
        </CustomerAddressFormContext.Provider>
      </ShippingAddressFormContext.Provider>
    </BillingAddressFormContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("AddressInput", () => {
  it("renders an input element", () => {
    renderInput()
    expect(screen.getByPlaceholderText("First name")).toBeTruthy()
  })

  it("calls billing setValue when value is provided", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billing = makeBillingCtx() as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const shipping = makeShippingCtx() as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customer = makeCustomerCtx() as any
    render(
      <BillingAddressFormContext.Provider value={billing}>
        <ShippingAddressFormContext.Provider value={shipping}>
          <CustomerAddressFormContext.Provider value={customer}>
            <AddressInput name={"billing_address_first_name" as any} value="John" />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    await act(async () => {})
    expect(billing.setValue).toHaveBeenCalledWith("billing_address_first_name", "John")
  })

  it("applies errorClassName when billing field has error", () => {
    renderInput(
      {},
      {
        errors: {
          billing_address_first_name: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-invalid",
      }
    )
    expect(screen.getByRole("textbox").className).toContain("is-invalid")
  })

  it("applies errorClassName when shipping field has error", () => {
    renderInput(
      {},
      { errors: {}, errorClassName: "" }, // no billing errorClassName
      {
        errors: {
          billing_address_first_name: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-invalid",
      }
    )
    expect(screen.getByRole("textbox").className).toContain("is-invalid")
  })

  it("does not apply errorClassName when no error", () => {
    renderInput({}, { errors: {}, errorClassName: "is-invalid" })
    expect(screen.getByRole("textbox").className).not.toContain("is-invalid")
  })

  it("returns null for billing_info when requiresBillingInfo is false", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = makeBillingCtx({ requiresBillingInfo: false }) as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const shippingCtx = makeShippingCtx() as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customerCtx = makeCustomerCtx() as any
    const { container } = render(
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={shippingCtx}>
          <CustomerAddressFormContext.Provider value={customerCtx}>
            <AddressInput name={"billing_address_billing_info" as any} />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders billing_info when requiresBillingInfo is true", () => {
    renderInput({ name: "billing_address_billing_info" as any }, { requiresBillingInfo: true })
    expect(screen.getByRole("textbox")).toBeTruthy()
  })

  it("returns null for shipping billing_info when requiresBillingInfo is false", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const billingCtx = makeBillingCtx() as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const shippingCtx = makeShippingCtx({ requiresBillingInfo: false }) as any
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const customerCtx = makeCustomerCtx() as any
    const { container } = render(
      <BillingAddressFormContext.Provider value={billingCtx}>
        <ShippingAddressFormContext.Provider value={shippingCtx}>
          <CustomerAddressFormContext.Provider value={customerCtx}>
            <AddressInput name={"shipping_address_billing_info" as any} />
          </CustomerAddressFormContext.Provider>
        </ShippingAddressFormContext.Provider>
      </BillingAddressFormContext.Provider>
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders billing_info when required=true even if requiresBillingInfo is false", () => {
    renderInput(
      { name: "billing_address_billing_info" as any, required: true },
      { requiresBillingInfo: false }
    )
    expect(screen.getByRole("textbox")).toBeTruthy()
  })

  it("applies required from isBusiness mandatory fields", () => {
    renderInput({ name: "billing_address_company" as any }, { isBusiness: true })
    expect((screen.getByRole("textbox") as HTMLInputElement).required).toBe(true)
  })

  it("applies errorClassName when customer address field has error", () => {
    renderInput(
      {},
      { errors: {}, errorClassName: "is-invalid" }, // billing provides the errorClassName
      {},
      {
        errors: {
          billing_address_first_name: { code: "ERR", message: "required", error: true },
        },
      }
    )
    expect(screen.getByRole("textbox").className).toContain("is-invalid")
  })
})
