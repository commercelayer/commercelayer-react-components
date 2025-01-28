import type { ResourceIncluded } from '#reducers/OrderReducer'
import type { Order } from '@commercelayer/sdk'

interface Params {
  order: Order
  resourceInclude: ResourceIncluded[]
}

export default function checkIncludeResources({
  order,
  resourceInclude
}: Params): boolean {
  const checkKeys: boolean[] = []
  resourceInclude.forEach((v) => {
    const isMultiKey = v.includes('.')
    if (isMultiKey) {
      const [first] = v.split('.')
      const resource = order?.[first as keyof Order]
      if (resource === undefined) checkKeys.push(false)
    } else {
      const resource = order?.[v as keyof Order]
      if (resource === undefined) checkKeys.push(false)
    }
  })
  return checkKeys.length === 0
}
