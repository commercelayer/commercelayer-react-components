import React, {
  useContext,
  FunctionComponent,
  ReactNode,
  Fragment,
} from 'react'
import Parent from './utils/Parent'
// import components from '#config/components'
import OrderListChildrenContext from '#context/OrderListChildrenContext'
import { Cell, Row } from 'react-table'
import isDate from '#utils/isDate'
import last from 'lodash/last'
import OrderAttributes from '#typings/order'

// const propTypes = components.OrderListRow.propTypes
// const displayName = components.OrderListRow.displayName

type OrderListHeaderChildrenProps = Omit<OrderListHeaderProps, 'children'> & {
  order: Record<string, any>
  row: Row
  cell: Cell[]
}

type OrderListHeaderProps = {
  children?: (props: OrderListHeaderChildrenProps) => ReactNode
  field: keyof OrderAttributes
} & JSX.IntrinsicElements['td']

const OrderListRow: FunctionComponent<OrderListHeaderProps> = ({
  field,
  children,
  ...p
}) => {
  const {
    order,
    row,
    showActions,
    actionsComponent,
    actionsContainerClassName,
  } = useContext(OrderListChildrenContext)
  const cell = row.cells.filter((cell) => cell.column.id === field)
  const isLastRow = last(row.cells)?.column.id === field
  const ActionRow = () => {
    return (
      (showActions && isLastRow && actionsComponent && (
        <td {...p} className={actionsContainerClassName}>
          <Parent {...parentProps}>{actionsComponent}</Parent>
        </td>
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
  }
  return children ? (
    <Fragment>
      <Parent {...parentProps}>{children}</Parent>
      <ActionRow />
    </Fragment>
  ) : (
    <Fragment>
      {cell.map((cell) => {
        const cellValue = cell.value
        const value = isDate(cellValue)
          ? new Date(Date.parse(cellValue)).toLocaleString()
          : cell.render('Cell')
        return (
          <td {...p} {...cell.getCellProps()}>
            {value}
          </td>
        )
      })}
      <ActionRow />
    </Fragment>
  )
}

// OrderListRow.propTypes = propTypes
// OrderListRow.displayName = displayName

export default OrderListRow
