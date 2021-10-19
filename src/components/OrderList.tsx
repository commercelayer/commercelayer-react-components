import React, {
  FunctionComponent,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  ReactElement,
} from 'react'
import components from '#config/components'
import CustomerContext from '#context/CustomerContext'
import OrderListChildrenContext from '#context/OrderListChildrenContext'
import { Column, HeaderGroup, useTable } from 'react-table'

const propTypes = components.OrderList.propTypes
const displayName = components.OrderList.displayName

type OrderListProps = {
  children: ReactNode
  columns: (Column & { className?: string })[]
  loadingElement?: ReactElement
} & JSX.IntrinsicElements['table']

type HeaderColumn = HeaderGroup & {
  className?: string
}

const OrderList: FunctionComponent<OrderListProps> = ({
  children,
  columns,
  loadingElement,
  ...p
}) => {
  const [loading, setLoading] = useState(true)
  const { orders } = useContext(CustomerContext)
  const data = useMemo(() => orders, [orders]) as Record<
    string,
    string | number
  >[]
  const cols = useMemo(() => columns, [columns]) as Column<
    Record<string, string | number>
  >[]
  const table = useTable({ data, columns: cols })
  useEffect(() => {
    orders && orders.length > 0 && setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [orders])
  const LoadingComponent = loadingElement || <div>Loading...</div>
  const headerComponent = table.headerGroups.map((headerGroup) => {
    const columns = headerGroup.headers.map((column: HeaderColumn) => {
      return (
        <th {...column.getHeaderProps()} className={column?.className}>
          {column.render('Header')}
        </th>
      )
    })
    return <tr {...headerGroup.getHeaderGroupProps()}>{columns}</tr>
  })
  const components = table.rows.map((row, i) => {
    table.prepareRow(row)
    const childProps = {
      order: orders?.[i] || {},
      row,
    }
    return (
      <tr {...row.getRowProps()}>
        <OrderListChildrenContext.Provider value={childProps}>
          {children}
        </OrderListChildrenContext.Provider>
      </tr>
    )
  })
  return loading ? (
    LoadingComponent
  ) : (
    <table {...p} {...table.getTableProps()}>
      <thead>{headerComponent}</thead>
      <tbody {...table.getTableBodyProps()}>{components}</tbody>
    </table>
  )
}

OrderList.propTypes = propTypes
OrderList.displayName = displayName

export default OrderList
