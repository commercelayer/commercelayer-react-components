import { createContext } from 'react'
import { Row } from 'react-table'

export interface InitialOrderListContext {
  order: Record<string, any>
  row: Row
}

const initial: InitialOrderListContext = {
  order: {},
  row: {} as any,
}

const OrderListChildrenContext = createContext<InitialOrderListContext>(initial)

export default OrderListChildrenContext
