import {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  CSSProperties
} from 'react'
import CustomerContext from '#context/CustomerContext'
import OrderListChildrenContext, {
  InitialOrderListContext
} from '#context/OrderListChildrenContext'
import {
  Column,
  HeaderGroup,
  useTable,
  useSortBy,
  UseSortByColumnProps,
  useBlockLayout,
  PluginHook
} from 'react-table'
import { FixedSizeList } from 'react-window'
import scrollbarWidth from '#utils/scrollbarWidth'
import { sortDescIcon, sortAscIcon } from '#utils/icons'
import type { Order } from '@commercelayer/sdk'

export type OrderListColumn = Column & {
  Header: string
  accessor: keyof Order
  className?: string
  titleClassName?: string
}

type Props = {
  children: JSX.Element[] | JSX.Element
  /**
   * Columns to show
   */
  columns: OrderListColumn[]
  /**
   * Custom loader component
   */
  loadingElement?: string | JSX.Element
  /**
   * Function to assign as custom row renderer
   */
  actionsComponent?: InitialOrderListContext['actionsComponent']
  /**
   * Class name to assign to the custom row container
   */
  actionsContainerClassName?: string
  /**
   * Show actions column
   */
  showActions?: boolean
  /**
   * Class name to assign to the table header
   */
  theadClassName?: string
  /**
   * Class name to assign to the table row
   */
  rowTrClassName?: string
} & Omit<JSX.IntrinsicElements['table'], 'children'> &
  (
    | {
        /**
         * Activate infinity scroll
         */
        infiniteScroll: true
        /**
         * The window options to use for the infinite scroll
         */
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
  extends HeaderGroup<Order>,
    Partial<UseSortByColumnProps<Order>> {
  className?: string
  titleClassName?: string
}

export function OrderList({
  children,
  columns,
  loadingElement,
  showActions = false,
  actionsComponent,
  actionsContainerClassName,
  infiniteScroll,
  windowOptions,
  theadClassName,
  rowTrClassName,
  ...p
}: Props): JSX.Element {
  const [loading, setLoading] = useState(true)
  const { orders } = useContext(CustomerContext)
  const data = useMemo<Order[]>(() => orders ?? [], [orders])
  const cols = useMemo(() => columns, [columns]) as Array<Column<Order>>
  const tablePlugins: Array<PluginHook<Order>> = [useSortBy]
  if (infiniteScroll) tablePlugins.push(useBlockLayout)
  const defaultColumn = useMemo(
    () => ({
      width: windowOptions?.column || 150
    }),
    [windowOptions?.column]
  )
  const table = useTable<Order>(
    { data, columns: cols, ...(infiniteScroll && { defaultColumn }) },
    ...tablePlugins
  )
  const TableHtmlElement = !infiniteScroll ? 'table' : 'div'
  const TheadHtmlElement = !infiniteScroll ? 'thead' : 'div'
  const TbodyHtmlElement = !infiniteScroll ? 'tbody' : 'div'
  const ThHtmlElement = !infiniteScroll ? 'th' : 'div'
  const TrHtmlElement = !infiniteScroll ? 'tr' : 'div'

  useEffect(() => {
    if (orders !== undefined) setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [orders])
  const scrollBarSize = infiniteScroll ? useMemo(() => scrollbarWidth(), []) : 0
  const LoadingComponent = loadingElement || <div>Loading...</div>
  const headerComponent = table.headerGroups.map((headerGroup, i) => {
    const columns = headerGroup.headers.map((column: HeaderColumn, k) => {
      const sortLabel = column.isSorted
        ? column.isSortedDesc
          ? 'desc'
          : 'asc'
        : ''
      return (
        <ThHtmlElement
          data-testid={`thead-${k}`}
          data-sort={`${sortLabel}`}
          className={column?.className}
          {...column.getHeaderProps(
            column?.getSortByToggleProps && column?.getSortByToggleProps()
          )}
          key={k}
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
      <TrHtmlElement {...headerGroup.getHeaderGroupProps()} key={i}>
        {columns}
      </TrHtmlElement>
    )
  })
  const components = !infiniteScroll
    ? table.rows.map((row, i) => {
        table.prepareRow(row)
        const childProps = {
          orders,
          order: orders?.[i] as Order,
          row,
          showActions,
          actionsComponent,
          actionsContainerClassName,
          infiniteScroll
        }
        return (
          <TrHtmlElement
            {...row.getRowProps()}
            className={rowTrClassName}
            key={i}
          >
            <OrderListChildrenContext.Provider value={childProps}>
              {children}
            </OrderListChildrenContext.Provider>
          </TrHtmlElement>
        )
      })
    : useCallback(
        ({ index, style }: { index: number; style: CSSProperties }) => {
          const row = table.rows[index]
          row && table.prepareRow(row)
          const childProps = {
            orders,
            order: orders?.[index] as Order,
            row,
            showActions,
            actionsComponent,
            actionsContainerClassName,
            infiniteScroll
          }
          return (
            <TrHtmlElement
              {...row?.getRowProps({ style })}
              className={rowTrClassName}
            >
              <OrderListChildrenContext.Provider value={childProps}>
                {children}
              </OrderListChildrenContext.Provider>
            </TrHtmlElement>
          )
        },
        [table.prepareRow, table.rows]
      )

  if (loading && orders == null) {
    return <>{LoadingComponent}</>
  }
  return orders?.length === 0 ? (
    <OrderListChildrenContext.Provider value={{ orders }}>
      {children}
    </OrderListChildrenContext.Provider>
  ) : (
    <TableHtmlElement {...p} {...table.getTableProps()}>
      <TheadHtmlElement className={theadClassName}>
        {headerComponent}
      </TheadHtmlElement>
      <TbodyHtmlElement {...table.getTableBodyProps()}>
        {!infiniteScroll ? (
          (components as JSX.Element[])
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

export default OrderList