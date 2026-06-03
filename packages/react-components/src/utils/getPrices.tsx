import type { Price } from "@commercelayer/sdk"
import PriceTemplate, { type PTemplateProps } from "#components/utils/PriceTemplate"

import type { JSX } from "react"

export function getPriceByCode(skuPrices: Price[], code: string = ""): Price | undefined {
  return code ? skuPrices.filter((p) => p.currency_code === code)[0] : skuPrices[0]
}

export function getPricesComponent(
  skuPrices: Price[],
  props: PTemplateProps
): JSX.Element[] | JSX.Element {
  if (skuPrices.length === 0) {
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
        // biome-ignore lint/suspicious/noArrayIndexKey: prices don't have stable ids in this context
        key={k}
        {...props}
        showCompare={showCompare}
        formattedAmount={p.formatted_amount}
        formattedCompare={p.formatted_compare_at_amount}
        skuCode={p.sku_code}
      />
    )
  })
}

export default function getPrices<P extends Price>(prices: P[]): Record<string, P[]> {
  const obj: Record<string, any> = {}
  if (Array.isArray(prices)) {
    prices.forEach((p) => {
      const sku = p?.sku_code ?? ""
      if (Object.hasOwn(obj, sku)) {
        obj[sku].push(p)
      } else {
        obj[sku] = [p]
      }
    })
  }
  return obj
}
