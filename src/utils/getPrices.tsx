import { isEmpty, first, isArray, has, forEach } from 'lodash'
import { PriceCollection } from '@commercelayer/js-sdk'
import { Prices, SkuPrices } from '#reducers/PriceReducer'
import { Items } from '#reducers/ItemReducer'
import React, { ReactNode } from 'react'
import PriceTemplate, { PTemplateProps } from '#components/utils/PriceTemplate'

export interface GetPriceByCode {
  (skuPrices: SkuPrices, code: string): PriceCollection | undefined
}

export const getPriceByCode: GetPriceByCode = (skuPrices, code = '') => {
  return code
    ? first(skuPrices.filter((p) => p.currencyCode === code))
    : first(skuPrices)
}

export interface GetPricesComponent {
  (skuPrices: PriceCollection[], props: PTemplateProps): ReactNode
}

export const getPricesComponent: GetPricesComponent = (skuPrices, props) => {
  if (isEmpty(skuPrices)) {
    return <PriceTemplate {...props} />
  }
  return skuPrices.map((p, k) => {
    const showCompare =
      (typeof props.showCompare === 'undefined' &&
        p.compareAtAmountCents > p.amountCents) ||
      props.showCompare
    return (
      <PriceTemplate
        key={k}
        {...props}
        showCompare={showCompare}
        formattedAmount={p.formattedAmount}
        formattedCompare={p.formattedCompareAtAmount}
      />
    )
  })
}

export interface GetPrices {
  (prices: PriceCollection[] | Items): Prices
}

const getPrices: GetPrices = (prices) => {
  const obj: Record<string, any> = {}
  if (isArray(prices)) {
    prices.map((p) => {
      if (has(obj, p.skuCode)) {
        obj[p.skuCode].push(p)
      } else {
        obj[p.skuCode] = [p]
      }
    })
  } else {
    forEach(prices, (item) => {
      const prices = item.prices()?.toArray()
      obj[item.code] = prices
    })
  }
  return obj
}

export default getPrices
