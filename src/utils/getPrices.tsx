import _ from 'lodash'
import { PriceCollection } from '@commercelayer/js-sdk'
import { Prices, SkuPrices } from '../reducers/PriceReducer'
import { Items } from '../reducers/ItemReducer'
import React, { ReactNode } from 'react'
import PriceTemplate, { PTemplateProps } from '../components/PriceTemplate'

export interface GetPriceByCode {
  (skuPrices: SkuPrices, code: string): PriceCollection | undefined
}

export const getPriceByCode: GetPriceByCode = (skuPrices, code = '') => {
  return code
    ? _.first(skuPrices.filter((p) => p.currencyCode === code))
    : _.first(skuPrices)
}

export interface GetPricesComponent {
  (skuPrices: PriceCollection[], props: PTemplateProps): ReactNode
}

export const getPricesComponent: GetPricesComponent = (skuPrices, props) => {
  if (_.isEmpty(skuPrices)) {
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
  const obj = {}
  if (_.isArray(prices)) {
    prices.map((p) => {
      if (_.has(obj, p.skuCode)) {
        obj[p.skuCode].push(p)
      } else {
        obj[p.skuCode] = [p]
      }
    })
  } else {
    _.forEach(prices, (item) => {
      const prices = item.prices().toArray()
      obj[item.code] = prices
    })
  }
  return obj
}

export default getPrices
