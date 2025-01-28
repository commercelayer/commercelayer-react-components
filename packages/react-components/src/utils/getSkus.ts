import type { Sku } from '@commercelayer/sdk'

const getSkus = (skus: Sku[], sortBy: string[]): Record<string, any> => {
  const obj: Record<string, Sku> = {}
  sortBy.forEach((sku) => {
    skus.forEach((o) => {
      if (o?.code === sku) obj[o.code] = o
    })
  })
  return obj
}

export default getSkus
