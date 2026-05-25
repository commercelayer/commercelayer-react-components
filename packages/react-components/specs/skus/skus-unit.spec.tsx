import { AvailabilityTemplate } from "#components/skus/AvailabilityTemplate"
import { DeliveryLeadTime } from "#components/skus/DeliveryLeadTime"
import { SkuField } from "#components/skus/SkuField"
import { SkuList } from "#components/skus/SkuList"
import { SkuListsContainer } from "#components/skus/SkuListsContainer"
import Parent from "#components/utils/Parent"
import AvailabilityContext from "#context/AvailabilityContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"
import SkuChildrenContext from "#context/SkuChildrenContext"
import SkuListsContext from "#context/SkuListsContext"
import { render, screen, waitFor } from "@testing-library/react"
import { createElement, type ReactNode } from "react"
import { SWRConfig } from "swr"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

// ---------------------------------------------------------------------------
// DeliveryLeadTime
// ---------------------------------------------------------------------------

describe("DeliveryLeadTime component", () => {
  it("renders the min_days value from context", () => {
    const mockContext = {
      deliveryLeadTimeForShipment: {
        min_days: 2,
        max_days: 5,
        min_hours: 48,
        max_hours: 120,
      } as any,
    }
    render(
      <ShippingMethodChildrenContext.Provider value={mockContext}>
        <DeliveryLeadTime type="min_days" data-testid="lead-time" />
      </ShippingMethodChildrenContext.Provider>
    )
    expect(screen.getByTestId("lead-time").textContent).toBe("2")
  })

  it("renders nothing when context has no deliveryLeadTime", () => {
    render(
      <ShippingMethodChildrenContext.Provider value={{}}>
        <DeliveryLeadTime type="min_days" data-testid="lead-time" />
      </ShippingMethodChildrenContext.Provider>
    )
    expect(screen.getByTestId("lead-time").textContent).toBe("")
  })

  it("clears text on unmount via useEffect cleanup", () => {
    const { unmount } = render(
      <ShippingMethodChildrenContext.Provider
        value={{ deliveryLeadTimeForShipment: { min_days: 5 } as any }}
      >
        <DeliveryLeadTime type="min_days" data-testid="lead-time-cleanup" />
      </ShippingMethodChildrenContext.Provider>
    )
    unmount()
    // verifies the cleanup function (setText('')) runs without errors
  })

  it("renders via children render prop", () => {
    const mockContext = {
      deliveryLeadTimeForShipment: { min_days: 3 } as any,
    }
    render(
      <ShippingMethodChildrenContext.Provider value={mockContext}>
        <DeliveryLeadTime type="min_days">
          {({ text }) => <span data-testid="custom">{text}</span>}
        </DeliveryLeadTime>
      </ShippingMethodChildrenContext.Provider>
    )
    expect(screen.getByTestId("custom")).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// AvailabilityTemplate
// ---------------------------------------------------------------------------

describe("AvailabilityTemplate component", () => {
  const wrapWithContext = (qty: number | undefined, min?: number, max?: number) =>
    createElement(
      AvailabilityContext.Provider,
      {
        value: {
          quantity: qty,
          skuCode: "TESTSKU",
          parent: true,
          min: min != null ? { hours: min * 24, days: min } : undefined,
          max: max != null ? { hours: max * 24, days: max } : undefined,
        },
      },
      createElement(AvailabilityTemplate, {
        labels: { available: "Available", outOfStock: "Out of stock", negativeStock: "Negative" },
      })
    )

  it("shows available text when quantity > 0", () => {
    render(wrapWithContext(5))
    expect(screen.getByTestId("availability-TESTSKU").textContent).toContain("Available")
  })

  it("shows out of stock when quantity === 0", () => {
    render(wrapWithContext(0))
    expect(screen.getByTestId("availability-TESTSKU").textContent).toContain("Out of stock")
  })

  it("shows negative stock text when quantity < 0", () => {
    render(wrapWithContext(-1))
    expect(screen.getByTestId("availability-TESTSKU").textContent).toContain("Negative")
  })

  it("renders empty span when quantity is undefined", () => {
    render(
      createElement(
        AvailabilityContext.Provider,
        { value: { skuCode: "TESTSKU-UNDEF", parent: true } },
        createElement(AvailabilityTemplate)
      )
    )
    expect(screen.getByTestId("availability-TESTSKU-UNDEF").textContent).toBe("")
  })

  it("shows delivery lead time with timeFormat when min/max are set", () => {
    render(
      createElement(
        AvailabilityContext.Provider,
        {
          value: {
            quantity: 10,
            skuCode: "TESTSKU2",
            parent: true,
            min: { hours: 24, days: 1 },
            max: { hours: 72, days: 3 },
          },
        },
        createElement(AvailabilityTemplate, { timeFormat: "days" })
      )
    )
    expect(screen.getByTestId("availability-TESTSKU2").textContent).toContain("1")
  })

  it("shows shipping method name when showShippingMethodName is true", () => {
    render(
      createElement(
        AvailabilityContext.Provider,
        {
          value: {
            quantity: 10,
            skuCode: "TESTSKU-SM",
            parent: true,
            min: { hours: 24, days: 1 },
            max: { hours: 72, days: 3 },
            shipping_method: { name: "Express", id: "1", type: "shipping_methods" } as any,
          },
        },
        createElement(AvailabilityTemplate, { timeFormat: "days", showShippingMethodName: true })
      )
    )
    expect(screen.getByTestId("availability-TESTSKU-SM").textContent).toContain("with Express")
  })

  it("shows shipping method price when showShippingMethodPrice is true", () => {
    render(
      createElement(
        AvailabilityContext.Provider,
        {
          value: {
            quantity: 10,
            skuCode: "TESTSKU-PRICE",
            parent: true,
            min: { hours: 24, days: 1 },
            max: { hours: 72, days: 3 },
            shipping_method: {
              name: "Standard",
              formatted_price_amount: "$5.00",
              id: "1",
              type: "shipping_methods",
            } as any,
          },
        },
        createElement(AvailabilityTemplate, { timeFormat: "days", showShippingMethodPrice: true })
      )
    )
    expect(screen.getByTestId("availability-TESTSKU-PRICE").textContent).toContain("($5.00)")
  })

  it("renders via children render prop", () => {
    render(
      createElement(
        AvailabilityContext.Provider,
        { value: { quantity: 5, skuCode: "TESTSKU3", parent: true } },
        createElement(AvailabilityTemplate, {
          children: ({ quantity }) =>
            createElement("span", { "data-testid": "custom-avail" }, String(quantity)),
        })
      )
    )
    expect(screen.getByTestId("custom-avail").textContent).toBe("5")
  })
})

// ---------------------------------------------------------------------------
// SkuField children render prop
// ---------------------------------------------------------------------------

describe("SkuField component", () => {
  it("renders via children render prop", () => {
    render(
      <SkuChildrenContext.Provider value={{ sku: { code: "SKU001" } as any }}>
        <SkuField attribute="code">
          {({ attributeValue }) => <span data-testid="custom-field">{String(attributeValue)}</span>}
        </SkuField>
      </SkuChildrenContext.Provider>
    )
    expect(screen.getByTestId("custom-field").textContent).toBe("SKU001")
  })

  it("renders default span tag when no children provided", () => {
    render(
      <SkuChildrenContext.Provider value={{ sku: { code: "SKU002" } as any }}>
        <SkuField attribute="code" />
      </SkuChildrenContext.Provider>
    )
    expect(screen.getByTestId("SKU002").textContent).toBe("SKU002")
  })

  it("renders custom tagElement when provided", () => {
    render(
      <SkuChildrenContext.Provider value={{ sku: { code: "SKU003" } as any }}>
        <SkuField attribute="code" tagElement="p" />
      </SkuChildrenContext.Provider>
    )
    const el = screen.getByTestId("SKU003")
    expect(el.tagName.toLowerCase()).toBe("p")
    expect(el.textContent).toBe("SKU003")
  })

  it("renders img tag when tagElement is img", () => {
    const { container } = render(
      <SkuChildrenContext.Provider
        value={{ sku: { image_url: "https://example.com/img.jpg" } as any }}
      >
        <SkuField attribute="image_url" tagElement="img" />
      </SkuChildrenContext.Provider>
    )
    const img = container.querySelector("img")
    expect(img).not.toBeNull()
    expect(img?.getAttribute("src")).toBe("https://example.com/img.jpg")
  })

  it("renders img with defaultImgUrl when attribute value is empty", () => {
    const { container } = render(
      <SkuChildrenContext.Provider value={{ sku: { image_url: "" } as any }}>
        <SkuField attribute="image_url" tagElement="img" />
      </SkuChildrenContext.Provider>
    )
    const img = container.querySelector("img")
    expect(img).not.toBeNull()
    expect(img?.getAttribute("src")).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// Parent utility component
// ---------------------------------------------------------------------------

describe("Parent component", () => {
  it("returns null when children is undefined", () => {
    const { container } = render(<Parent />)
    expect(container.firstChild).toBeNull()
  })

  it("renders children when provided", () => {
    const Child = ({ label }: { label: string }) => <span data-testid="parent-child">{label}</span>
    render(<Parent>{Child}</Parent>)
    expect(screen.getByTestId("parent-child")).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// SkuList inside SkuListsContainer
// ---------------------------------------------------------------------------

describe("SkuList component", () => {
  it("renders its children", () => {
    render(
      <CommerceLayerContext.Provider value={{ accessToken: undefined as any, endpoint: "" }}>
        <SkuListsContainer>
          <SkuList id="test-list-id">
            <span data-testid="list-child">content</span>
          </SkuList>
        </SkuListsContainer>
      </CommerceLayerContext.Provider>,
      { wrapper: swrWrapper }
    )
    expect(screen.getByTestId("list-child").textContent).toBe("content")
  })

  it("registers the id in SkuListsContext", async () => {
    let capturedIds: string[] = []
    render(
      <CommerceLayerContext.Provider value={{ accessToken: undefined as any, endpoint: "" }}>
        <SkuListsContainer>
          <SkuList id="my-list">
            <span />
          </SkuList>
          <SkuListsContext.Consumer>
            {({ listIds }) => {
              capturedIds = listIds
              return null
            }}
          </SkuListsContext.Consumer>
        </SkuListsContainer>
      </CommerceLayerContext.Provider>,
      { wrapper: swrWrapper }
    )
    await waitFor(() => expect(capturedIds).toContain("my-list"), { timeout: 2000 })
  })
})
