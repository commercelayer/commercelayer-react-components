import { isEmpty, first, isArray, has } from 'lodash'
import type { Price } from '@commercelayer/sdk'
import PriceTemplate, {
  type PTemplateProps
} from '#components/utils/PriceTemplate'

import type { JSX } from "react";

export function getPriceByCode(
  skuPrices: Price[],
  code: string = ''
): Price | undefined {
  return code
    ? first(skuPrices.filter((p) => p.currency_code === code))
    : first(skuPrices)
}

export function getPricesComponent(
  skuPrices: Price[],
  props: PTemplateProps
): JSX.Element[] | JSX.Element {
  if (isEmpty(skuPrices)) {
    return <PriceTemplate {...props} />
  }
  return skuPrices.map((p, k) => {
    const showCompare =
      (typeof props.showCompare === 'undefined' &&
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
  prices: P[]
): Record<string, P[]> {
  const obj: Record<string, any> = {}
  if (isArray(prices)) {
    prices.forEach((p) => {
      const sku = p?.sku_code ?? ''
      if (has(obj, sku)) {
        obj[sku].push(p)
      } else {
        obj[sku] = [p]
      }
    })
  }
  return obj
}
