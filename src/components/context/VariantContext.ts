import { createContext } from 'react'
import { VariantState } from '../../reducers/VariantReducer'

const initial: VariantState = {
  loading: false,
  variants: {},
  skuCodes: [],
  skuCode: '',
  currentSkuId: '',
  currentQuantity: 1,
  currentPrices: [],
  currentSkuInventory: {
    available: false,
    quantity: 0,
    levels: []
  }
}

const VariantContext = createContext(initial)

export default VariantContext
