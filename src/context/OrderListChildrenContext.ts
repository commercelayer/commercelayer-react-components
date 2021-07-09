import OrderAttributes from '#typings/order'
import { createContext, ReactNode } from 'react'
import { Row } from 'react-table'

export interface InitialOrderListContext {
  order: OrderAttributes | null
  row: Row<OrderAttributes>
  showActions: boolean
  actionsComponent?: (props: { order: OrderAttributes }) => ReactNode
  actionsContainerClassName?: string
}

const initial: InitialOrderListContext = {
  order: null,
  row: {} as any,
  showActions: false,
}

const OrderListChildrenContext = createContext<InitialOrderListContext>(initial)

export default OrderListChildrenContext
