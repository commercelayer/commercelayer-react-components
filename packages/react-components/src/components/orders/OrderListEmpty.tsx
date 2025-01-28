import Parent from '#components/utils/Parent'
import OrderListChildrenContext from '#context/OrderListChildrenContext'
import type { ChildrenFunction } from '#typings/index'
import { useContext, type JSX } from 'react';

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  /**
   * Function allow you to customize the component
   */
  children?: ChildrenFunction<Omit<Props, 'children'>>
  /**
   * Label to show. Default: 'No orders available.'
   */
  emptyText?: string
}

export function OrderListEmpty(props: Props): JSX.Element | null {
  const { children, emptyText = 'No orders available', ...p } = props
  const { orders } = useContext(OrderListChildrenContext)
  const parentProps = { emptyText, ...p }
  if (orders != null && orders.length > 0) {
    return null
  }
  return children !== undefined ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{emptyText}</span>
  )
}

OrderListEmpty.displayName = 'OrderListEmpty'

export default OrderListEmpty
