import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CustomerField } from "#components/customers/CustomerField"
import { ParcelField } from "#components/parcels/ParcelField"
import { ParcelLineItemField } from "#components/parcels/ParcelLineItemField"
import GenericFieldComponent from "#components/utils/GenericFieldComponent"
import CustomerContext from "#context/CustomerContext"
import ParcelChildrenContext from "#context/ParcelChildrenContext"
import ParcelLineItemChildrenContext from "#context/ParcelLineItemChildrenContext"
import { defaultImgUrl } from "#utils/placeholderImages"

describe("CustomerField", () => {
  it("renders a customer attribute", () => {
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <CustomerContext.Provider value={{ customers: { email: "a@b.com" } } as any}>
        <CustomerField attribute="email" />
      </CustomerContext.Provider>
    )

    expect(screen.getByText("a@b.com")).toBeDefined()
  })

  it("hands the value to a children function", () => {
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <CustomerContext.Provider value={{ customers: { email: "a@b.com" } } as any}>
        <CustomerField attribute="email">
          {({ attributeValue }) => <span data-testid="custom">{`<${attributeValue}>`}</span>}
        </CustomerField>
      </CustomerContext.Provider>
    )

    expect(screen.getByTestId("custom").textContent).toBe("<a@b.com>")
  })
})

describe("ParcelField", () => {
  it("renders a parcel attribute", () => {
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <ParcelChildrenContext.Provider value={{ parcel: { number: "P-1" } } as any}>
        <ParcelField attribute="number" />
      </ParcelChildrenContext.Provider>
    )

    expect(screen.getByText("P-1")).toBeDefined()
  })

  it("renders with a custom tag element", () => {
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <ParcelChildrenContext.Provider value={{ parcel: { number: "P-2" } } as any}>
        <ParcelField attribute="number" tagElement="p" />
      </ParcelChildrenContext.Provider>
    )

    expect(screen.getByText("P-2").tagName).toBe("P")
  })
})

describe("ParcelLineItemField", () => {
  it("renders a parcel line item attribute", () => {
    render(
      <ParcelLineItemChildrenContext.Provider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        value={{ parcelLineItem: { name: "T-shirt" } } as any}
      >
        <ParcelLineItemField attribute="name" />
      </ParcelLineItemChildrenContext.Provider>
    )

    expect(screen.getByText("T-shirt")).toBeDefined()
  })

  it("renders an image from the attribute value", () => {
    const { container } = render(
      <ParcelLineItemChildrenContext.Provider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        value={{ parcelLineItem: { image_url: "https://img.test/a.png" } } as any}
      >
        <ParcelLineItemField attribute="image_url" tagElement="img" />
      </ParcelLineItemChildrenContext.Provider>
    )

    // The img is rendered with an empty alt, so it carries role="presentation".
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://img.test/a.png")
  })
})

describe("GenericFieldComponent", () => {
  it("falls back to the placeholder image when the attribute is empty", () => {
    const { container } = render(
      <ParcelLineItemChildrenContext.Provider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        value={{ parcelLineItem: { image_url: "" } } as any}
      >
        <ParcelLineItemField attribute="image_url" tagElement="img" />
      </ParcelLineItemChildrenContext.Provider>
    )

    expect(container.querySelector("img")?.getAttribute("src")).toBe(defaultImgUrl)
  })

  it("prefers a children function over the img branch", () => {
    const { container } = render(
      <ParcelLineItemChildrenContext.Provider
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        value={{ parcelLineItem: { image_url: "https://img.test/a.png" } } as any}
      >
        <ParcelLineItemField attribute="image_url" tagElement="img">
          {({ attributeValue }) => <span data-testid="custom">{attributeValue}</span>}
        </ParcelLineItemField>
      </ParcelLineItemChildrenContext.Provider>
    )

    expect(screen.getByTestId("custom").textContent).toBe("https://img.test/a.png")
    expect(container.querySelector("img")).toBeNull()
  })

  it("renders an empty value when the context holds no matching resource", () => {
    const { container } = render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <ParcelChildrenContext.Provider value={{} as any}>
        <GenericFieldComponent
          resource="parcel"
          attribute="number"
          tagElement="span"
          context={ParcelChildrenContext}
        />
      </ParcelChildrenContext.Provider>
    )

    expect(container.textContent).toBe("")
  })

  it("defaults to a span when no tag element is given", () => {
    render(
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      <ParcelChildrenContext.Provider value={{ parcel: { number: "P-3" } } as any}>
        <GenericFieldComponent
          resource="parcel"
          attribute="number"
          // biome-ignore lint/suspicious/noExplicitAny: exercising the tag fallback
          tagElement={undefined as any}
          context={ParcelChildrenContext}
        />
      </ParcelChildrenContext.Provider>
    )

    expect(screen.getByText("P-3").tagName).toBe("SPAN")
  })
})
