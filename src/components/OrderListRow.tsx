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

// const propTypes = components.OrderListRow.propTypes
// const displayName = components.OrderListRow.displayName

type OrderListHeaderChildrenProps = Omit<OrderListHeaderProps, 'children'> & {
  order: Record<string, any>
  row: Row
  cell: Cell[]
}

type OrderListHeaderProps = {
  children?: (props: OrderListHeaderChildrenProps) => ReactNode
  field: string
} & JSX.IntrinsicElements['td']

const OrderListRow: FunctionComponent<OrderListHeaderProps> = ({
  field,
  children,
  ...p
}) => {
  const { order, row } = useContext(OrderListChildrenContext)
  const cell = row.cells.filter((cell) => cell.column.id === field)
  const parentProps = {
    ...p,
    field,
    order,
    row,
    cell,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
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
    </Fragment>
  )
}

// OrderListRow.propTypes = propTypes
// OrderListRow.displayName = displayName

export default OrderListRow
