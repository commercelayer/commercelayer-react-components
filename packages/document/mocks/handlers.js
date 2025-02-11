import adjustments from './data/adjustments'
import bundles from './data/bundles'
import lineItems from './data/line_items'
import markets from './data/markets'
import orders from './data/orders'
import tags from './data/tags'

export const handlers = [
  ...adjustments,
  ...bundles,
  ...lineItems,
  ...markets,
  ...orders,
  ...tags
]
