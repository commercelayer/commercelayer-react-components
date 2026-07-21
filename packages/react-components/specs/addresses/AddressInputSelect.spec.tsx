import { act, render, screen } from "@testing-library/react"
import AddressInputSelect from "#components/addresses/AddressInputSelect"
import type { DefaultContextAddress } from "#context/BillingAddressFormContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"

vi.mock("@commercelayer/core-components", () => ({}))

const OPTIONS = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
]

const mockBilling: Partial<DefaultContextAddress> = { setValue: vi.fn(), errors: {} }
const mockShipping: Partial<DefaultContextAddress> = { setValue: vi.fn(), errors: {} }

function renderSelect(
  props: Partial<Parameters<typeof AddressInputSelect>[0]> = {},
  billingOverride: Partial<DefaultContextAddress> = {},
  shippingOverride: Partial<DefaultContextAddress> = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const billingCtx = { ...mockBilling, ...billingOverride } as any
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const shippingCtx = { ...mockShipping, ...shippingOverride } as any
  return render(
    <BillingAddressFormContext.Provider value={billingCtx}>
      <ShippingAddressFormContext.Provider value={shippingCtx}>
        <AddressInputSelect
          name={"billing_address_metadata_custom" as any}
          options={OPTIONS}
          {...props}
        />
      </ShippingAddressFormContext.Provider>
    </BillingAddressFormContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(mockBilling.setValue as ReturnType<typeof vi.fn>).mockReset()
  ;(mockShipping.setValue as ReturnType<typeof vi.fn>).mockReset()
})

describe("AddressInputSelect", () => {
  it("renders a select with given options", () => {
    renderSelect()
    expect(screen.getByRole("combobox")).toBeTruthy()
    expect(screen.getByText("Option A")).toBeTruthy()
    expect(screen.getByText("Option B")).toBeTruthy()
  })

  it("calls billing setValue when value prop is provided", async () => {
    renderSelect({ value: "a" })
    await act(async () => {})
    expect(mockBilling.setValue).toHaveBeenCalledWith("billing_address_metadata_custom", "a")
  })

  it("calls shipping setValue when value prop is provided", async () => {
    renderSelect({ value: "b" })
    await act(async () => {})
    expect(mockShipping.setValue).toHaveBeenCalledWith("billing_address_metadata_custom", "b")
  })

  it("does not call setValue when value is not provided", async () => {
    renderSelect({})
    await act(async () => {})
    expect(mockBilling.setValue).not.toHaveBeenCalled()
    expect(mockShipping.setValue).not.toHaveBeenCalled()
  })

  it("applies errorClassName when billing field has error", () => {
    renderSelect(
      {},
      {
        errors: {
          billing_address_metadata_custom: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-error",
      }
    )
    expect(screen.getByRole("combobox").className).toContain("is-error")
  })

  it("does not apply errorClassName when no error", () => {
    renderSelect({}, { errors: {}, errorClassName: "is-error" })
    expect(screen.getByRole("combobox").className).not.toContain("is-error")
  })

  it("applies errorClassName when shipping field has error", () => {
    renderSelect(
      {},
      { errors: {} },
      {
        errors: {
          billing_address_metadata_custom: { code: "ERR", message: "required", error: true },
        },
        errorClassName: "is-error",
      }
    )
    expect(screen.getByRole("combobox").className).toContain("is-error")
  })
})
