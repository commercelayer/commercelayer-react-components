import { describe, expect, it } from "vitest"
import {
  addCurrencySymbol,
  type Currency,
  formatCentsToCurrency,
  getCurrency,
  getDecimalLength,
  makePlaceholder,
} from "#utils/currencies"

describe("getCurrency", () => {
  it("looks a currency up case-insensitively", () => {
    expect(getCurrency("EUR")?.iso_code).toBe("EUR")
    expect(getCurrency("eur")?.iso_code).toBe("EUR")
  })

  it("returns undefined for an unknown code", () => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising the unknown-code path
    expect(getCurrency("ZZZ" as any)).toBeUndefined()
  })
})

describe("getDecimalLength", () => {
  it.each([
    ["EUR", 2],
    ["USD", 2],
    // Zero-decimal currency.
    ["JPY", 0],
    // Four-decimal currency.
    ["CLF", 4],
  ])("%s has %i decimals", (code, expected) => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(getDecimalLength(getCurrency(code as any) as Currency)).toBe(expected)
  })
})

describe("addCurrencySymbol", () => {
  it("prefixes the symbol when symbol_first", () => {
    const currency = { symbol: "€", symbol_first: true } as Currency

    expect(addCurrencySymbol({ formattedValue: "1,00", currency })).toBe("€1,00")
  })

  it("suffixes the symbol otherwise", () => {
    const currency = { symbol: "kr", symbol_first: false } as Currency

    expect(addCurrencySymbol({ formattedValue: "1,00", currency })).toBe("1,00kr")
  })

  it("returns an empty string when there is no value", () => {
    const currency = { symbol: "€", symbol_first: true } as Currency

    expect(
      // biome-ignore lint/suspicious/noExplicitAny: exercising the null-value guard
      addCurrencySymbol({ formattedValue: null as any, currency })
    ).toBe("")
  })
})

describe("makePlaceholder", () => {
  it("builds a placeholder with the currency's decimals and mark", () => {
    expect(makePlaceholder(getCurrency("EUR") as Currency)).toBe("0,00")
    expect(makePlaceholder(getCurrency("USD") as Currency)).toBe("0.00")
    expect(makePlaceholder(getCurrency("CLF") as Currency)).toBe("0,0000")
  })

  it("collapses to a bare zero for zero-decimal currencies", () => {
    expect(makePlaceholder(getCurrency("JPY") as Currency)).toBe("0")
  })

  it("applies a prefix", () => {
    expect(makePlaceholder(getCurrency("EUR") as Currency, "€")).toBe("€0,00")
  })
})

describe("formatCentsToCurrency", () => {
  it.each([
    [100, "EUR", "€1,00"],
    [100000, "USD", "$1000.00"],
    [100, "JPY", "¥100"],
    [0, "EUR", "€0,00"],
  ])("formats %i %s as %s", (cents, code, expected) => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(formatCentsToCurrency(cents, code as any)).toBe(expected)
  })

  it("strips decimals on a whole unit when asked", () => {
    expect(formatCentsToCurrency(100, "EUR", true)).toBe("€1")
  })

  it("keeps decimals on a fractional unit even when stripping", () => {
    expect(formatCentsToCurrency(150, "EUR", true)).toBe("€1,50")
  })

  it("falls back to the raw cents for an unknown currency", () => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising the unknown-currency path
    expect(formatCentsToCurrency(1234, "ZZZ" as any)).toBe("1234")
  })
})
