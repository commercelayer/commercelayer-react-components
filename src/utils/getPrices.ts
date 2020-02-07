import _ from 'lodash'
import { SkuCollection } from '@commercelayer/js-sdk'
import { Prices } from '../reducers/PriceReducer'
import { Items } from '../reducers/ItemReducer'

const getPrices = (prices: SkuCollection[] | Items): Prices => {
  const obj = {}
  if (_.isArray(prices)) {
    prices.map(sku => {
      const price = _.first(sku.prices().toArray())
      obj[sku.code] = price
    })
  } else {
    _.forEach(prices, item => {
      const price = _.first(item.prices().toArray())
      obj[item.code] = price
    })
  }
  return obj
}

export default getPrices
