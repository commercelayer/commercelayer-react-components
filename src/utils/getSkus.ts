import _ from 'lodash'
import { SkuCollection } from '@commercelayer/js-sdk'

export default function getSkus(prices: SkuCollection[]) {
  const obj = {}
  prices.map(sku => {
    obj[sku.code] = sku
  })
  return obj
}
