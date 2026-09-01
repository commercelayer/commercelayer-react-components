// Adyen's `locale` (Drop-in translations, client-side) and `shopperLocale` (payment request,
// used for the hosted pages Adyen renders itself) are different things. Commerce Layer's
// `order.language_code` is a bare ISO 639-1 code, so it has to be expanded for the latter.
import { getAdyenShopperLocale } from "#utils/adyenShopperLocale"

describe("getAdyenShopperLocale", () => {
  it("expands a bare language whose region mirrors it", () => {
    expect(getAdyenShopperLocale("it")).toBe("it-IT")
    expect(getAdyenShopperLocale("de")).toBe("de-DE")
    expect(getAdyenShopperLocale("fr")).toBe("fr-FR")
    expect(getAdyenShopperLocale("nl")).toBe("nl-NL")
  })

  it("expands a bare language whose region differs", () => {
    // The reported case: an English Drop-in handing over to a Klarna page. `en-EN` is not a
    // locale, so it needs the explicit mapping.
    expect(getAdyenShopperLocale("en")).toBe("en-US")
    expect(getAdyenShopperLocale("sv")).toBe("sv-SE")
    expect(getAdyenShopperLocale("cs")).toBe("cs-CZ")
    expect(getAdyenShopperLocale("ja")).toBe("ja-JP")
  })

  it("normalises a locale that already carries a region", () => {
    expect(getAdyenShopperLocale("en-US")).toBe("en-US")
    expect(getAdyenShopperLocale("en_US")).toBe("en-US")
    expect(getAdyenShopperLocale("PT_br")).toBe("pt-BR")
  })

  it("returns undefined rather than guessing", () => {
    // Preserves Adyen's own fallback instead of sending a locale it may reject.
    expect(getAdyenShopperLocale(undefined)).toBeUndefined()
    expect(getAdyenShopperLocale(null)).toBeUndefined()
    expect(getAdyenShopperLocale("")).toBeUndefined()
    expect(getAdyenShopperLocale("xx")).toBeUndefined()
  })
})
