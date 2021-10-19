import { Sku } from '@commercelayer/sdk'

const getSkus = (prices: Sku[]): Record<string, any> => {
  const obj: Record<string, any> = {}
  prices.map((sku) => {
    obj[sku.code as string] = sku
  })
  return obj
}

export default getSkus
