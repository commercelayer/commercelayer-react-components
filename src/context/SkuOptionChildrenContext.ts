import { createContext } from 'react'
import { SkuOptionCollection } from '@commercelayer/js-sdk'

export interface SkuOptionChildrenInitalState {
  skuOption?: SkuOptionCollection | null
  skuCode: string
}

const initial: SkuOptionChildrenInitalState = {
  skuCode: '',
}

const SkuOptionChildrenContext = createContext<SkuOptionChildrenInitalState>(
  initial
)

export default SkuOptionChildrenContext
