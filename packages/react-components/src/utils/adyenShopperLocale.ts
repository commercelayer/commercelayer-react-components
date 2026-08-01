/**
 * Adyen uses two different locales, and they are not interchangeable:
 *
 * - `locale` in the Core configuration is **client-side only** — it picks the Drop-in's
 *   translation bundle.
 * - `shopperLocale` in the payment request is what Adyen uses for anything it renders
 *   itself, in particular the hosted pages a redirect payment method sends the shopper to
 *   (Klarna, iDEAL, …). Without it Adyen falls back to the merchant account default or the
 *   country code, which is why a Drop-in in English could hand over to a Klarna page in
 *   Italian.
 *
 * Adyen expects a language code combined with a region (`en-US`, `it-IT`). Commerce Layer's
 * `order.language_code` is a bare ISO 639-1 code (`en`, `it`), so it has to be expanded.
 */

/**
 * Region to pair with a bare language code. Only languages whose Adyen-supported locale
 * cannot be derived by uppercasing the language itself need an entry here.
 */
const REGION_BY_LANGUAGE: Record<string, string> = {
  en: "US",
  zh: "CN",
  ar: "AE",
  he: "IL",
  ja: "JP",
  ko: "KR",
  uk: "UA",
  el: "GR",
  cs: "CZ",
  da: "DK",
  sv: "SE",
  nb: "NO",
  no: "NO",
  sl: "SI",
  et: "EE",
  be: "BY",
}

/** Languages for which `xx` → `xx-XX` is the Adyen-supported locale (it → it-IT, and so on). */
const SELF_REGION_LANGUAGES = new Set([
  "it",
  "de",
  "fr",
  "es",
  "pt",
  "nl",
  "pl",
  "fi",
  "hu",
  "ro",
  "ru",
  "sk",
  "tr",
  "hr",
  "lt",
  "lv",
  "bg",
  "is",
])

/**
 * Resolves the `shopperLocale` to send with an Adyen payment request.
 *
 * @param locale the locale already driving the Drop-in — `order.language_code`, or the
 *   component's `locale` prop. Accepts a bare language (`en`), or a language and region in
 *   either separator (`en-US`, `en_US`).
 * @returns an Adyen-style `language-REGION` locale, or `undefined` when the language cannot
 *   be expanded confidently. Returning `undefined` deliberately preserves Adyen's own
 *   fallback rather than sending a locale it may reject.
 */
export function getAdyenShopperLocale(
  locale?: string | null,
): string | undefined {
  if (locale == null) return undefined
  const [rawLanguage, rawRegion] = locale.replace("_", "-").split("-")
  const language = rawLanguage?.toLowerCase()
  if (!language) return undefined
  // Already carries a region: normalise the separator and casing and trust it.
  if (rawRegion) return `${language}-${rawRegion.toUpperCase()}`
  const region =
    REGION_BY_LANGUAGE[language] ??
    (SELF_REGION_LANGUAGES.has(language) ? language.toUpperCase() : undefined)
  return region ? `${language}-${region}` : undefined
}
