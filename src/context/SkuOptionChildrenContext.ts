import { createContext } from 'react'
import { SkuOptionCollection } from '@commercelayer/js-sdk'

export interface SkuOptionChildrenInitalState {
  skuOption?: SkuOptionCollection | null
  skuCode?: string
}

const initial: SkuOptionChildrenInitalState = {}

const SkuOptionChildrenContext = createContext(initial)

export default SkuOptionChildrenContext
