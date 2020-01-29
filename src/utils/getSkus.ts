import { SkuCollection } from '@commercelayer/js-sdk'

const getSkus = (prices: SkuCollection[]): object => {
  const obj = {}
  prices.map(sku => {
    obj[sku.code] = sku
  })
  return obj
}

export default getSkus
