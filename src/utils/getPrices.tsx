import { isEmpty, first, isArray, has } from 'lodash'
import { Price } from '@commercelayer/sdk'
import { Prices } from '#reducers/PriceReducer'
import { Items } from '#reducers/ItemReducer'
import React, { ReactNode } from 'react'
import PriceTemplate, { PTemplateProps } from '#components/utils/PriceTemplate'

export interface GetPriceByCode {
  (skuPrices: Price[], code: string): Price | undefined
}

export const getPriceByCode: GetPriceByCode = (skuPrices, code = '') => {
  return code
    ? first(skuPrices.filter((p) => p.currency_code === code))
    : first(skuPrices)
}

export interface GetPricesComponent {
  (skuPrices: Price[], props: PTemplateProps): ReactNode
}

export const getPricesComponent: GetPricesComponent = (skuPrices, props) => {
  if (isEmpty(skuPrices)) {
    return <PriceTemplate {...props} />
  }
  return skuPrices.map((p, k) => {
    const showCompare =
      (typeof props.showCompare === 'undefined' &&
        (p?.compare_at_amount_cents as number) > (p?.amount_cents as number)) ||
      props.showCompare
    return (
      <PriceTemplate
        {...props}
        key={k}
        showCompare={showCompare}
        formattedAmount={p.formatted_amount}
        formattedCompare={p.formatted_compare_at_amount}
      />
    )
  })
}

export interface GetPrices {
  (prices: Price[] | Items): Prices
}

export default function getPrices<P extends Price>(prices: P[]) {
  const obj: Record<string, any> = {}
  if (isArray(prices)) {
    prices.forEach((p) => {
      const sku = p.sku_code as string
      if (has(obj, sku)) {
        obj[sku].push(p)
      } else {
        obj[sku] = [p]
      }
    })
  }
  // else {
  //   debugger
  //   // forEach(prices, (item) => {
  //   //   const prices = item.prices()?.toArray()
  //   //   obj[item.code] = prices
  //   // })
  // }
  return obj
}
