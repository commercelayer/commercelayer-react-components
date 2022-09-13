import type { Order } from '@commercelayer/sdk'
import { createContext } from 'react'
import { Row } from 'react-table'

export type InitialOrderListContext = Partial<{
  /**
   * The current order
   */
  order: Order | null
  /**
   * The current row
   */
  row: Row<Order>
  /**
   * Show the row actions
   */
  showActions: boolean
  /**
   * Function to assign as custom row renderer
   */
  actionsComponent: (props: { order: Order }) => JSX.Element
  /**
   * Class name to assign as custom row renderer
   */
  actionsContainerClassName: string
  /**
   * Infinite scroll enabled
   */
  infiniteScroll: boolean
}>

const initial: InitialOrderListContext = {
  showActions: false,
}

const OrderListChildrenContext = createContext<InitialOrderListContext>(initial)

export default OrderListChildrenContext
