import { Sku } from '@commercelayer/sdk'

const getSkus = (skus: Sku[]): Record<string, any> => {
  const obj: Record<string, Sku> = {}
  skus.forEach((sku) => {
    if (sku?.code) obj[sku.code] = sku
  })
  return obj
}

export default getSkus
