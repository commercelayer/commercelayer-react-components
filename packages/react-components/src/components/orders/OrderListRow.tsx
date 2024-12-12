import { type ReactNode, useContext, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import OrderListChildrenContext, {
  type TOrderList,
  type OrderListContent,
  type TableAccessor
} from '#context/OrderListChildrenContext'
import isDate from '#utils/isDate'
import last from 'lodash/last'
import { flexRender, type Row } from '@tanstack/react-table'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * The order resource
   */
  order: OrderListContent<TOrderList>
  /**
   * The current row
   */
  row: Row<OrderListContent<TOrderList>>
  /**
   * The current cell
   */
  cell: Array<
    ReturnType<Row<OrderListContent<TOrderList>>['getVisibleCells']>[number]
  >
}

interface Props extends Omit<JSX.IntrinsicElements['td'], 'children'> {
  children?: (props: ChildrenProps) => JSX.Element
  /**
   * The order field to show
   */
  field: TableAccessor<TOrderList>
}

export function OrderListRow({ field, children, ...p }: Props): JSX.Element {
  const {
    order,
    row,
    showActions,
    actionsComponent,
    actionsContainerClassName
  } = useContext(OrderListChildrenContext)
  const cell = row?.getVisibleCells().filter((cell) => cell.column.id === field)
  const isLastRow = last(row?.getVisibleCells())?.column.id === field
  const As = 'td'
  const ActionRow = (): JSX.Element | null => {
    return (
      (showActions && isLastRow && actionsComponent && (
        <As
          data-testid='action-cell'
          {...p}
          className={actionsContainerClassName}
        >
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
    cell
  }
  return children ? (
    <>
      <As>
        <Parent {...parentProps}>{children}</Parent>
      </As>
      <ActionRow />
    </>
  ) : (
    <>
      {cell?.map((cell, k) => {
        const cellValue = cell.getValue<string>()
        const value = isDate(cellValue)
          ? new Date(Date.parse(cellValue)).toLocaleString()
          : (flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            ) as ReactNode)
        return (
          <As data-testid={`cell-${k}`} {...p} key={cell.id}>
            {value}
          </As>
        )
      })}
      <ActionRow />
    </>
  )
}

OrderListRow.displayName = 'OrderListRow'

export default OrderListRow
