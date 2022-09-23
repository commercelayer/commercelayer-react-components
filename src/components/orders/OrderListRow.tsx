import { useContext } from 'react'
import Parent from '../utils/Parent'
import OrderListChildrenContext from '#context/OrderListChildrenContext'
import { Cell, Row } from 'react-table'
import isDate from '#utils/isDate'
import last from 'lodash/last'
import type { Order } from '@commercelayer/sdk'

type ChildrenProps = Omit<Props, 'children'> & {
  /**
   * The order resource
   */
  order: Order
  /**
   * The current row
   */
  row: Row
  /**
   * The current cell
   */
  cell: Cell[]
  /**
   * Infinite scroll enabled
   */
  infiniteScroll: boolean
}

type Props = {
  children?: (props: ChildrenProps) => JSX.Element
  /**
   * The order field to show
   */
  field: keyof Order
} & Omit<JSX.IntrinsicElements['td'], 'children'>

export function OrderListRow({ field, children, ...p }: Props): JSX.Element {
  const {
    order,
    row,
    showActions,
    actionsComponent,
    actionsContainerClassName,
    infiniteScroll
  } = useContext(OrderListChildrenContext)
  const cell: Array<Cell<Order, string>> | undefined = row?.cells.filter(
    (cell) => cell.column.id === field
  )
  const isLastRow = last(row?.cells)?.column.id === field
  const As = infiniteScroll ? 'div' : 'td'
  const ActionRow = (): JSX.Element | null => {
    return (
      (showActions && isLastRow && actionsComponent && (
        <As {...p} className={actionsContainerClassName}>
          <Parent {...parentProps}>{actionsComponent}</Parent>
        </As>
      )) ||
      null
    )
  }
  const parentProps = {
    ...p,
    field,
    order,
    row,
    cell,
    infiniteScroll
  }
  return children ? (
    <>
      <Parent {...parentProps}>{children}</Parent>
      <ActionRow />
    </>
  ) : (
    <>
      {cell?.map((cell, k) => {
        const cellValue = cell.value
        const value = isDate(cellValue)
          ? new Date(Date.parse(cellValue)).toLocaleString()
          : cell.render('Cell')
        return (
          <As {...p} {...cell.getCellProps()} key={k}>
            {value}
          </As>
        )
      })}
      <ActionRow />
    </>
  )
}

export default OrderListRow
