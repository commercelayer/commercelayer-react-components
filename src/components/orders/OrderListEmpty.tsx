import Parent from '#components/utils/Parent'
import OrderListChildrenContext from '#context/OrderListChildrenContext'
import { FunctionChildren } from '#typings/index'
import { useContext } from 'react'

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  /**
   * Function allow you to customize the component
   */
  children?: FunctionChildren<Props>
  /**
   * Label to show. Default: 'No orders available.'
   */
  emptyText?: string
}

export function OrderListEmpty(props: Props): JSX.Element | null {
  const { children, emptyText = 'No orders available', ...p } = props
  const { orders } = useContext(OrderListChildrenContext)
  const parentProps = { emptyText, ...p }
  console.log('OrderListEmpty', orders)
  if (orders != null && orders.length > 0) {
    return null
  }
  return children !== undefined ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{emptyText}</span>
  )
}

export default OrderListEmpty
