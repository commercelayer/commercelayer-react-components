import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { AdjustmentAmount } from "#components/orders/AdjustmentAmount"
import { DiscountAmount } from "#components/orders/DiscountAmount"
import { OrderNumber } from "#components/orders/OrderNumber"
import { PaymentMethodAmount } from "#components/orders/PaymentMethodAmount"
import { ShippingAmount } from "#components/orders/ShippingAmount"
import { SubTotalAmount } from "#components/orders/SubTotalAmount"
import { TaxesAmount } from "#components/orders/TaxesAmount"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import getAmount from "#utils/getAmount"

const ORDER = {
  id: "order-1",
  number: 2826178,
  formatted_subtotal_amount: "€145,00",
  subtotal_amount_cents: 14500,
  formatted_discount_amount: "-€50,00",
  discount_amount_cents: -5000,
  formatted_shipping_amount: "€10,00",
  shipping_amount_cents: 1000,
  formatted_total_tax_amount: "€0,00",
  total_tax_amount_cents: 0,
  formatted_adjustment_amount: "€1,00",
  adjustment_amount_cents: 100,
  formatted_payment_method_amount: "€2,00",
  payment_method_amount_cents: 200,
}

function withOrder(children: ReactNode, order: unknown = ORDER) {
  return render(
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    <OrderContext.Provider value={{ ...defaultOrderContext, order } as any}>
      {children}
    </OrderContext.Provider>
  )
}

describe("order amount components", () => {
  it.each([
    ["SubTotalAmount", SubTotalAmount, "€145,00", 14500],
    ["DiscountAmount", DiscountAmount, "-€50,00", -5000],
    ["ShippingAmount", ShippingAmount, "€10,00", 1000],
    ["TaxesAmount", TaxesAmount, "€0,00", 0],
    ["AdjustmentAmount", AdjustmentAmount, "€1,00", 100],
    ["PaymentMethodAmount", PaymentMethodAmount, "€2,00", 200],
  ])("%s renders its formatted amount", (_name, Component, expected) => {
    withOrder(<Component data-testid="amount" />)

    expect(screen.getByTestId("amount").textContent).toBe(expected)
  })

  it.each([
    ["SubTotalAmount", SubTotalAmount, "€145,00", 14500],
    ["DiscountAmount", DiscountAmount, "-€50,00", -5000],
    ["ShippingAmount", ShippingAmount, "€10,00", 1000],
    ["TaxesAmount", TaxesAmount, "€0,00", 0],
    ["AdjustmentAmount", AdjustmentAmount, "€1,00", 100],
    ["PaymentMethodAmount", PaymentMethodAmount, "€2,00", 200],
  ])("%s hands price and cents to a children function", (_name, Component, price, cents) => {
    withOrder(
      <Component>
        {({ price: p, priceCents }) => <span data-testid="custom">{`${p}|${priceCents}`}</span>}
      </Component>
    )

    expect(screen.getByTestId("custom").textContent).toBe(`${price}|${cents}`)
  })

  it("renders an empty amount when the order has none", () => {
    withOrder(<SubTotalAmount data-testid="amount" />, {})

    expect(screen.getByTestId("amount").textContent).toBe("")
  })

  it("reads the raw cents when asked for that format", () => {
    withOrder(<SubTotalAmount data-testid="amount" format="cents" />)

    expect(screen.getByTestId("amount").textContent).toBe("14500")
  })

  it("passes props through to the span", () => {
    withOrder(<SubTotalAmount className="total" data-testid="amount" />)

    expect(screen.getByTestId("amount").className).toBe("total")
  })
})

describe("OrderNumber", () => {
  it("renders the order number", () => {
    withOrder(<OrderNumber data-testid="number" />)

    expect(screen.getByTestId("number").textContent).toBe("2826178")
  })

  it("renders nothing when the order has no number", () => {
    withOrder(<OrderNumber data-testid="number" />, {})

    expect(screen.getByTestId("number").textContent).toBe("")
  })

  it("renders nothing without an order at all", () => {
    withOrder(<OrderNumber data-testid="number" />, null)

    expect(screen.getByTestId("number").textContent).toBe("")
  })

  it("hands the attribute to a children function", () => {
    withOrder(
      <OrderNumber>
        {({ attribute }) => <span data-testid="custom">{`#${attribute}`}</span>}
      </OrderNumber>
    )

    expect(screen.getByTestId("custom").textContent).toBe("#2826178")
  })
})

describe("getAmount", () => {
  it.each([
    // format_type_base
    [{ formatted_subtotal_amount: "€1" }, "formatted", "€1"],
    // type_base_format
    [{ subtotal_amount_cents: 100 }, "cents", 100],
  ])("resolves %o for the %s format", (obj, format, expected) => {
    expect(getAmount({ base: "amount", type: "subtotal", format, obj })).toBe(expected)
  })

  it("resolves the format_base_type key order", () => {
    expect(
      getAmount({
        base: "amount",
        type: "subtotal",
        format: "formatted",
        obj: { formatted_amount_subtotal: "€1" },
      })
    ).toBe("€1")
  })

  it("resolves the base_type_format key order", () => {
    expect(
      getAmount({
        base: "amount",
        type: "subtotal",
        format: "cents",
        obj: { amount_subtotal_cents: 100 },
      })
    ).toBe(100)
  })

  it("returns undefined when no key matches", () => {
    expect(
      getAmount({ base: "amount", type: "subtotal", format: "formatted", obj: { other: 1 } })
    ).toBeUndefined()
  })

  it("returns undefined for an empty object", () => {
    expect(
      getAmount({ base: "amount", type: "subtotal", format: "formatted", obj: {} })
    ).toBeUndefined()
  })
})
