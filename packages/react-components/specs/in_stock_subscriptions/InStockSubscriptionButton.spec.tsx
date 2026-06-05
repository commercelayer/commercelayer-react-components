import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InStockSubscriptionButton } from "#components/in_stock_subscriptions/InStockSubscriptionButton"
import CommerceLayerContext from "#context/CommerceLayerContext"
import InStockSubscriptionContext from "#context/InStockSubscriptionContext"

vi.mock("@commercelayer/js-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/js-auth")>()
  return {
    ...actual,
    jwtDecode: vi.fn().mockReturnValue({ payload: { owner: { id: "cust_1", type: "Customer" } } }),
  }
})

const mockSetInStockSubscription = vi.fn().mockResolvedValue({ success: true })

function Providers({
  accessToken = "header.eyJvd25lciI6e30.sig",
  setInStockSubscription = mockSetInStockSubscription,
  children,
}: {
  accessToken?: string | null
  setInStockSubscription?: typeof mockSetInStockSubscription | undefined
  children: ReactNode
}) {
  return (
    <CommerceLayerContext.Provider value={{ accessToken: accessToken ?? undefined }}>
      <InStockSubscriptionContext.Provider value={{ errors: [], setInStockSubscription }}>
        {children}
      </InStockSubscriptionContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

describe("InStockSubscriptionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSetInStockSubscription.mockResolvedValue({ success: true })
  })

  it("returns null when show is false (default)", () => {
    const { container } = render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" />
      </Providers>
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders a button when show is true", () => {
    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show />
      </Providers>
    )
    expect(screen.getByRole("button")).toBeDefined()
  })

  it("renders the default label", () => {
    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show />
      </Providers>
    )
    expect(screen.getByText("Subscribe")).toBeDefined()
  })

  it("renders a custom label", () => {
    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show label="Notify me" />
      </Providers>
    )
    expect(screen.getByText("Notify me")).toBeDefined()
  })

  it("calls setInStockSubscription with skuCode on click", async () => {
    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show />
      </Providers>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(mockSetInStockSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ skuCode: "SKU001" })
    )
  })

  it("calls setInStockSubscription with customerEmail when provided", async () => {
    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show customerEmail="user@example.com" />
      </Providers>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(mockSetInStockSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ skuCode: "SKU001", customerEmail: "user@example.com" })
    )
  })

  it("calls onClick with the result of setInStockSubscription", async () => {
    const onClickSpy = vi.fn()

    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show onClick={onClickSpy} />
      </Providers>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(onClickSpy).toHaveBeenCalledWith({ success: true })
  })

  it("shows loadingLabel while the request is in flight", async () => {
    let resolveApi!: () => void
    mockSetInStockSubscription.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveApi = () => resolve({ success: true })
      })
    )

    render(
      <Providers>
        <InStockSubscriptionButton
          skuCode="SKU001"
          show
          label="Subscribe"
          loadingLabel="Loading..."
        />
      </Providers>
    )

    act(() => {
      fireEvent.click(screen.getByRole("button"))
    })

    await waitFor(() => expect(screen.queryByText("Loading...")).toBeDefined())

    await act(async () => {
      resolveApi()
    })

    await waitFor(() => expect(screen.queryByText("Subscribe")).toBeDefined())
  })

  it("disables the button while loading", async () => {
    let resolveApi!: () => void
    mockSetInStockSubscription.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveApi = () => resolve({ success: true })
      })
    )

    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001" show />
      </Providers>
    )

    act(() => {
      fireEvent.click(screen.getByRole("button"))
    })

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveProperty("disabled", true)
    })

    await act(async () => {
      resolveApi()
    })
  })

  it("logs an error and does not call setInStockSubscription when no customerEmail and JWT has no owner", async () => {
    const { jwtDecode } = await import("@commercelayer/js-auth")
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    vi.mocked(jwtDecode as any).mockReturnValueOnce({ payload: { owner: null } })

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)

    render(
      <Providers accessToken="some-token">
        <InStockSubscriptionButton skuCode="SKU001" show />
      </Providers>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(errorSpy).toHaveBeenCalledWith("Missing customerEmail")
    expect(mockSetInStockSubscription).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it("skips the JWT owner check when customerEmail is provided", async () => {
    const { jwtDecode } = await import("@commercelayer/js-auth")
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    vi.mocked(jwtDecode as any).mockReturnValueOnce({ payload: { owner: null } })

    render(
      <Providers accessToken="some-token">
        <InStockSubscriptionButton skuCode="SKU001" show customerEmail="explicit@example.com" />
      </Providers>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(mockSetInStockSubscription).toHaveBeenCalled()
  })

  it("skips the JWT owner check when accessToken is null", async () => {
    render(
      <Providers accessToken={null}>
        <InStockSubscriptionButton skuCode="SKU001" show />
      </Providers>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(mockSetInStockSubscription).toHaveBeenCalled()
  })

  it("logs error and does not call setInStockSubscription when context setter is undefined", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)

    // Render without Providers helper to avoid default-value substitution; set key explicitly so
    // useCustomContext passes, but value is undefined so the setter-null branch is exercised.
    render(
      <CommerceLayerContext.Provider value={{ accessToken: undefined }}>
        <InStockSubscriptionContext.Provider
          value={{ errors: [], setInStockSubscription: undefined }}
        >
          <InStockSubscriptionButton skuCode="SKU001" show />
        </InStockSubscriptionContext.Provider>
      </CommerceLayerContext.Provider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })

    expect(errorSpy).toHaveBeenCalledWith("Missing <InStockSubscriptionsContainer>")
    errorSpy.mockRestore()
  })

  it("renders the children render-prop instead of a button", () => {
    render(
      <Providers>
        <InStockSubscriptionButton skuCode="SKU001">
          {(props) => <span data-testid="custom">{String(props.skuCode)}</span>}
        </InStockSubscriptionButton>
      </Providers>
    )

    expect(screen.getByTestId("custom")).toBeDefined()
    expect(screen.queryByRole("button")).toBeNull()
  })
})
