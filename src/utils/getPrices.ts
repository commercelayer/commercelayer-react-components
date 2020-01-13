import _ from 'lodash'
import { SkuCollection } from '@commercelayer/js-sdk'

export default function getPrices(prices: SkuCollection[]) {
  const obj = {}
  prices.map(sku => {
    const price = _.first(sku.prices().toArray())
    obj[sku.code] = price
  })
  return obj
}
