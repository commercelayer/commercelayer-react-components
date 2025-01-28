import Parent from '#components/utils/Parent'
import OrderListPaginationContext from '#context/OrderListPaginationContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'

import type { JSX } from "react";

type TAsComponent = keyof Pick<JSX.IntrinsicElements, 'p' | 'span' | 'div'>

type ChildrenProps<A extends TAsComponent> = Omit<Props<A>, 'children'> & {
  /**
   * Current number of the first page row to display
   */
  firstRow: number
  /**
   * Current number of the last page row to display
   */
  lastRow: number
  /**
   * Total number of rows to display
   */
  totRows: number
}

type Props<A extends TAsComponent> = {
  children?: ChildrenFunction<ChildrenProps<A>>
  /**
   * HTML Tag to display
   */
  as?: TAsComponent
} & Omit<JSX.IntrinsicElements[A], 'children' | 'ref'>

export function OrderListPaginationInfo<A extends TAsComponent = 'span'>({
  as = 'span',
  children,
  ...props
}: Props<A>): JSX.Element | null {
  const ctx = useCustomContext({
    context: OrderListPaginationContext,
    contextComponentName: 'OrderList',
    currentComponentName: 'OrderListPaginationInfo',
    key: 'totalRows'
  })
  const TagElement = as
  const totRows = ctx?.totalRows ?? 0
  const pageIndex = ctx?.pageIndex ?? 0
  const pageSize = ctx?.pageSize ?? 10
  let firstRow = pageIndex === 0 ? pageIndex + 1 : pageIndex
  let lastRow = firstRow * pageSize
  if (ctx?.canPreviousPage === true) {
    firstRow = Math.floor(firstRow * pageSize) + 1
    lastRow = Math.floor(firstRow + pageSize - 1)
  }
  if (ctx?.canNextPage === false) {
    lastRow = totRows
  }
  const parentProps = { ...props, as, firstRow, lastRow, totRows }
  return children == null ? (
    totRows === 0 ? null : (
      <TagElement {...props}>
        {`${firstRow} - ${lastRow} of ${totRows}`}
      </TagElement>
    )
  ) : (
    <Parent {...parentProps}>{children}</Parent>
  )
}

OrderListPaginationInfo.displayName = 'OrderListPaginationInfo'

export default OrderListPaginationInfo
