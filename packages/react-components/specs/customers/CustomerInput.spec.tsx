import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { CustomerInput } from "#components/customers/CustomerInput"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext, { defaultCustomerContext } from "#context/CustomerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"

function renderInput(
  overrides: {
    customerOverrides?: Record<string, unknown>
    orderOverrides?: Record<string, unknown>
    props?: Record<string, unknown>
  } = {}
) {
  const saveCustomerUser = vi.fn()
  const setCustomerErrors = vi.fn()
  const setCustomerEmail = vi.fn()
  const setOrderErrors = vi.fn()

  const customerContext = {
    ...defaultCustomerContext,
    saveCustomerUser,
    setCustomerErrors,
    setCustomerEmail,
    ...overrides.customerOverrides,
  }
  const orderContext = {
    ...defaultOrderContext,
    setOrderErrors,
    ...overrides.orderOverrides,
  }

  const result = render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider value={{ accessToken: "token" } as any}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <CustomerContext.Provider value={customerContext as any}>
        {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
        <OrderContext.Provider value={orderContext as any}>
          <CustomerInput data-testid="input" {...(overrides.props as any)} />
        </OrderContext.Provider>
      </CustomerContext.Provider>
    </CommerceLayerContext.Provider>
  )

  return { ...result, saveCustomerUser, setCustomerErrors, setCustomerEmail, setOrderErrors }
}

describe("CustomerInput", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a text input with correct defaults", () => {
    renderInput()
    const input = screen.getByTestId("input")
    expect(input.tagName).toBe("INPUT")
    expect(input.getAttribute("type")).toBe("email")
    expect(input.getAttribute("name")).toBe("customer_email")
    expect(input.hasAttribute("required")).toBe(true)
  })

  it("calls setCustomerEmail and clears errors on valid blur", async () => {
    const { setCustomerErrors, setCustomerEmail, setOrderErrors } = renderInput()
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "user@example.com" } })

    await waitFor(() => {
      expect(setCustomerEmail).toHaveBeenCalledWith("user@example.com")
      expect(setCustomerErrors).toHaveBeenCalledWith([])
      expect(setOrderErrors).toHaveBeenCalledWith([])
    })
  })

  it("sets validation error on invalid email blur", async () => {
    const { setCustomerErrors, setOrderErrors } = renderInput()
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "not-an-email" } })

    await waitFor(() => {
      expect(setCustomerErrors).toHaveBeenCalledWith([
        expect.objectContaining({ code: "VALIDATION_ERROR", resource: "orders" }),
      ])
      expect(setOrderErrors).toHaveBeenCalledWith([
        expect.objectContaining({ code: "VALIDATION_ERROR" }),
      ])
    })
  })

  it("calls saveCustomerUser when saveOnBlur is true and email is valid", async () => {
    const { saveCustomerUser } = renderInput({ props: { saveOnBlur: true } })
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "user@example.com" } })

    await waitFor(() => {
      expect(saveCustomerUser).toHaveBeenCalledWith("user@example.com")
    })
  })

  it("does not call saveCustomerUser when email is invalid", async () => {
    const { saveCustomerUser } = renderInput({ props: { saveOnBlur: true } })
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "bad-email" } })

    await waitFor(() => {
      expect(saveCustomerUser).not.toHaveBeenCalled()
    })
  })

  it("applies errorClassName when there is a field error", async () => {
    renderInput({ props: { errorClassName: "error-class" } })
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "invalid" } })

    await waitFor(() => {
      expect(input.className).toContain("error-class")
    })
  })

  it("does not apply errorClassName on valid input", async () => {
    renderInput({ props: { errorClassName: "error-class" } })
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "user@example.com" } })

    await waitFor(() => {
      expect(input.className).not.toContain("error-class")
    })
  })

  it("calls onBlur callback when saveOnBlur is true and email valid", async () => {
    const onBlur = vi.fn()
    renderInput({ props: { saveOnBlur: true, onBlur } })
    const input = screen.getByTestId("input")

    fireEvent.blur(input, { target: { value: "user@example.com" } })

    await waitFor(() => {
      expect(onBlur).toHaveBeenCalledWith("user@example.com")
    })
  })

  it("does not call saveCustomerUser when it is undefined", async () => {
    const { saveCustomerUser } = renderInput({
      props: { saveOnBlur: true },
      customerOverrides: { saveCustomerUser: undefined },
    })
    const input = screen.getByTestId("input")

    await act(async () => {
      fireEvent.blur(input, { target: { value: "user@example.com" } })
    })

    expect(saveCustomerUser).not.toHaveBeenCalled()
  })

  it("accepts a custom name prop", () => {
    renderInput({ props: { name: "email", type: "text" } })
    const input = screen.getByTestId("input")
    expect(input.getAttribute("name")).toBe("email")
  })
})
