import type { Price } from "@commercelayer/sdk"
import PriceTemplate, {
  type PTemplateProps,
} from "#components/utils/PriceTemplate"

import type { JSX } from "react"

export function getPriceByCode(
  skuPrices: Price[],
  code = "",
): Price | undefined {
  return code ? skuPrices.find((p) => p.currency_code === code) : skuPrices[0]
}

export function getPricesComponent(
  skuPrices: Price[],
  props: PTemplateProps,
): JSX.Element[] | JSX.Element {
  if (!skuPrices || skuPrices.length === 0) {
    return <PriceTemplate {...props} />
  }
  return skuPrices.map((p, k) => {
    const showCompare =
      (typeof props.showCompare === "undefined" &&
        p?.compare_at_amount_cents != null &&
        p?.compare_at_amount_cents > p?.amount_cents) ||
      props.showCompare
    return (
      <PriceTemplate
        {...props}
        key={k}
        showCompare={showCompare}
        formattedAmount={p.formatted_amount}
        formattedCompare={p.formatted_compare_at_amount}
        skuCode={p.sku_code}
      />
    )
  })
}

export default function getPrices<P extends Price>(
  prices: P[],
): Record<string, P[]> {
  const obj: Record<string, any> = {}
  if (Array.isArray(prices)) {
    for (const p of prices) {
      const sku = p?.sku_code ?? ""
      if (sku in obj) {
        obj[sku].push(p)
      } else {
        obj[sku] = [p]
      }
    }
  }
  return obj
}
