import { SkuCollection } from '@commercelayer/js-sdk'

const getSkus = (prices: SkuCollection[]): Record<string, any> => {
  const obj: Record<string, any> = {}
  prices.map((sku) => {
    obj[sku.code] = sku
  })
  return obj
}

export default getSkus
