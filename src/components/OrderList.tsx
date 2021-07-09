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
import OrderListChildrenContext, {
  InitialOrderListContext,
} from '#context/OrderListChildrenContext'
import {
  Column,
  HeaderGroup,
  useTable,
  useSortBy,
  UseSortByColumnProps,
} from 'react-table'
import OrderAttributes from '#typings/order'

const propTypes = components.OrderList.propTypes
const displayName = components.OrderList.displayName
const sortDescIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
    />
  </svg>
)

const sortAscIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>
)

type OrderListProps = {
  children: ReactNode
  columns: (Column & { className?: string })[]
  loadingElement?: ReactElement
  actionsComponent?: InitialOrderListContext['actionsComponent']
  actionsContainerClassName?: string
  showActions?: boolean
} & JSX.IntrinsicElements['table']

interface HeaderColumn
  extends HeaderGroup<OrderAttributes>,
    Partial<UseSortByColumnProps<OrderAttributes>> {
  className?: string
  titleClassName?: string
}

const OrderList: FunctionComponent<OrderListProps> = ({
  children,
  columns,
  loadingElement,
  showActions = false,
  actionsComponent,
  actionsContainerClassName,
  ...p
}) => {
  const [loading, setLoading] = useState(true)
  const { orders } = useContext(CustomerContext)
  const data = useMemo<OrderAttributes[]>(
    () => orders as OrderAttributes[],
    [orders]
  )
  const cols = useMemo(() => columns, [columns]) as Column<OrderAttributes>[]
  const table = useTable<OrderAttributes>({ data, columns: cols }, useSortBy)
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
        <th
          className={column?.className}
          {...column.getHeaderProps(
            column?.getSortByToggleProps && column?.getSortByToggleProps()
          )}
        >
          <span className={column?.titleClassName}>
            {column.render('Header')}
            {column.isSorted
              ? column.isSortedDesc
                ? sortDescIcon
                : sortAscIcon
              : ''}
          </span>
        </th>
      )
    })
    return <tr {...headerGroup.getHeaderGroupProps()}>{columns}</tr>
  })
  const components = table.rows.map((row, i) => {
    table.prepareRow(row)
    const childProps = {
      order: orders?.[i] as OrderAttributes,
      row,
      showActions,
      actionsComponent,
      actionsContainerClassName,
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
