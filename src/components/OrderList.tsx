import React, {
  FunctionComponent,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  ReactElement,
  useCallback,
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
  useBlockLayout,
} from 'react-table'
import OrderAttributes from '#typings/order'
import { FixedSizeList } from 'react-window'
import scrollbarWidth from '#utils/scrollbarWidth'
import { sortDescIcon, sortAscIcon } from '#utils/icons'

const propTypes = components.OrderList.propTypes
const displayName = components.OrderList.displayName

type OrderListProps = {
  children: ReactNode
  columns: (Column & { className?: string })[]
  loadingElement?: ReactElement
  actionsComponent?: InitialOrderListContext['actionsComponent']
  actionsContainerClassName?: string
  showActions?: boolean
} & JSX.IntrinsicElements['table'] &
  (
    | {
        infiniteScroll: true
        windowOptions?: {
          height?: number
          itemSize?: number
          width?: number
          column?: number
        }
      }
    | {
        infiniteScroll?: false
        windowOptions?: never
      }
  )

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
  infiniteScroll,
  windowOptions,
  ...p
}) => {
  const [loading, setLoading] = useState(true)
  const { orders } = useContext(CustomerContext)
  const data = useMemo<OrderAttributes[]>(
    () => orders as OrderAttributes[],
    [orders]
  )
  const cols = useMemo(() => columns, [columns]) as Column<OrderAttributes>[]
  const tablePlugins: any[] = [useSortBy]
  if (infiniteScroll) tablePlugins.push(useBlockLayout)
  const defaultColumn = React.useMemo(
    () => ({
      width: windowOptions?.column || 150,
    }),
    [windowOptions?.column]
  )
  const table = useTable<OrderAttributes>(
    { data, columns: cols, ...(infiniteScroll && { defaultColumn }) },
    ...tablePlugins
  )
  const TableHtmlElement = !infiniteScroll ? 'table' : 'div'
  const TheadHtmlElement = !infiniteScroll ? 'thead' : 'div'
  const TbodyHtmlElement = !infiniteScroll ? 'tbody' : 'div'
  const ThHtmlElement = !infiniteScroll ? 'th' : 'div'
  const TrHtmlElement = !infiniteScroll ? 'tr' : 'div'

  useEffect(() => {
    orders && orders.length > 0 && setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [orders])
  const scrollBarSize = infiniteScroll ? useMemo(() => scrollbarWidth(), []) : 0
  const LoadingComponent = loadingElement || <div>Loading...</div>
  const headerComponent = table.headerGroups.map((headerGroup) => {
    const columns = headerGroup.headers.map((column: HeaderColumn) => {
      return (
        <ThHtmlElement
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
        </ThHtmlElement>
      )
    })
    return (
      <TrHtmlElement {...headerGroup.getHeaderGroupProps()}>
        {columns}
      </TrHtmlElement>
    )
  })
  const components = !infiniteScroll
    ? table.rows.map((row, i) => {
        table.prepareRow(row)
        const childProps = {
          order: orders?.[i] as OrderAttributes,
          row,
          showActions,
          actionsComponent,
          actionsContainerClassName,
        }
        return (
          <TrHtmlElement {...row.getRowProps()}>
            <OrderListChildrenContext.Provider value={childProps}>
              {children}
            </OrderListChildrenContext.Provider>
          </TrHtmlElement>
        )
      })
    : useCallback(
        ({ index, style }) => {
          const row = table.rows[index]
          table.prepareRow(row)
          const childProps = {
            order: orders?.[index] as OrderAttributes,
            row,
            showActions,
            actionsComponent,
            actionsContainerClassName,
          }
          return (
            <TrHtmlElement {...row.getRowProps({ style })}>
              <OrderListChildrenContext.Provider value={childProps}>
                {children}
              </OrderListChildrenContext.Provider>
            </TrHtmlElement>
          )
        },
        [table.prepareRow, table.rows]
      )
  return loading ? (
    LoadingComponent
  ) : (
    <TableHtmlElement {...p} {...table.getTableProps()}>
      <TheadHtmlElement>{headerComponent}</TheadHtmlElement>
      <TbodyHtmlElement {...table.getTableBodyProps()}>
        {!infiniteScroll ? (
          components
        ) : (
          <FixedSizeList
            height={windowOptions?.height || 400}
            itemCount={table.rows.length}
            itemSize={windowOptions?.itemSize || 100}
            width={
              windowOptions?.width || table.totalColumnsWidth + scrollBarSize
            }
          >
            {components as () => JSX.Element}
          </FixedSizeList>
        )}
      </TbodyHtmlElement>
    </TableHtmlElement>
  )
}

OrderList.propTypes = propTypes
OrderList.displayName = displayName

export default OrderList
