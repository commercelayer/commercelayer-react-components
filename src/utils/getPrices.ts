import _ from 'lodash'
import { SkuCollection } from '@commercelayer/js-sdk'
import { Prices } from '../reducers/PriceReducer'

const getPrices = (prices: SkuCollection[]): Prices => {
  const obj = {}
  prices.map(sku => {
    const price = _.first(sku.prices().toArray())
    obj[sku.code] = price
  })
  return obj
}

export default getPrices
