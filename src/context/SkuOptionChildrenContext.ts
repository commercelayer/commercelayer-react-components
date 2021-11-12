import { createContext } from 'react'
import { SkuOption } from '@commercelayer/sdk'

export interface SkuOptionChildrenInitalState {
  skuOption?: SkuOption | null
  skuCode: string
}

const initial: SkuOptionChildrenInitalState = {
  skuCode: '',
}

const SkuOptionChildrenContext =
  createContext<SkuOptionChildrenInitalState>(initial)

export default SkuOptionChildrenContext
