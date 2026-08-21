import type { Address } from "@commercelayer/sdk"
import { render, screen } from "@testing-library/react"
import AddressesEmpty from "#components/addresses/AddressesEmpty"
import CustomerContext from "#context/CustomerContext"

vi.mock("@commercelayer/core-components", () => ({}))

function renderEmpty(
  addresses: Address[] | null | undefined,
  props: Parameters<typeof AddressesEmpty>[0] = {}
) {
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  const ctx = { addresses } as any
  return render(
    <CustomerContext.Provider value={ctx}>
      <AddressesEmpty {...props} />
    </CustomerContext.Provider>
  )
}

describe("AddressesEmpty", () => {
  it("renders default empty text when addresses is empty array", () => {
    renderEmpty([])
    expect(screen.getByTestId("addresses-empty").textContent).toBe("No addresses available.")
  })

  it("renders custom emptyText", () => {
    renderEmpty([], { emptyText: "Nothing here" })
    expect(screen.getByTestId("addresses-empty").textContent).toBe("Nothing here")
  })

  it("returns null when addresses has items", () => {
    const { container } = renderEmpty([{ id: "addr-1" } as Address])
    expect(container.innerHTML).toBe("")
  })

  it("returns null when addresses is null", () => {
    const { container } = renderEmpty(null)
    expect(container.innerHTML).toBe("")
  })

  it("returns null when addresses is undefined", () => {
    const { container } = renderEmpty(undefined)
    expect(container.innerHTML).toBe("")
  })

  it("renders custom children via render prop when empty", () => {
    const child = vi.fn(() => <span data-testid="custom">custom empty</span>)
    renderEmpty([], { children: child })
    expect(screen.getByTestId("custom").textContent).toBe("custom empty")
    expect(child.mock.calls[0][0]).toMatchObject({ emptyText: "No addresses available." })
  })
})
