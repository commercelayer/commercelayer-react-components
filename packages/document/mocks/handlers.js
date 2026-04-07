import adjustments from './data/adjustments'
import bundles from './data/bundles'
import lineItems from './data/line_items'
import markets from './data/markets'
import orders from './data/orders'
import skus from './data/skus'
import skuLists from './data/sku_lists'
import tags from './data/tags'

export const handlers = [
  ...adjustments,
  ...bundles,
  ...lineItems,
  ...markets,
  ...orders,
  ...skus,
  ...skuLists,
  ...tags
]
