import { useContext, useMemo, useState, useEffect, type ReactNode, type JSX } from 'react';
import CustomerContext from '#context/CustomerContext'
import OrderListChildrenContext, {
  type TOrderList,
  type InitialOrderListContext,
  type OrderListContent
} from '#context/OrderListChildrenContext'
import OrderListPagination from '#context/OrderListPaginationContext'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
  type PaginationState
} from '@tanstack/react-table'
import { sortDescIcon, sortAscIcon } from '#utils/icons'
import filterChildren from '#utils/filterChildren'
import type { DefaultChildrenType, TRange } from '#typings/globals'
import type { QueryPageSize } from '@commercelayer/sdk'

type RowComponent = 'OrderListRow' | 'OrderListEmpty'
type PaginationComponent =
  | 'OrderListPaginationInfo'
  | 'OrderListPaginationButtons'
const rowComponents: RowComponent[] = ['OrderListRow', 'OrderListEmpty']
const paginationComponents: PaginationComponent[] = [
  'OrderListPaginationInfo',
  'OrderListPaginationButtons'
]

type OrderListColumn<T extends TOrderList = 'orders'> = ColumnDef<
  OrderListContent<T>
> & {
  className?: string
  titleClassName?: string
}

export type TOrderListColumn<T extends TOrderList = 'orders'> =
  OrderListColumn<T>

type PaginationProps =
  | {
      /**
       * Show table pagination. Default is false.
       */
      showPagination: true
      /**
       * Number of rows per page. Default is 10. Max is 25.
       */
      pageSize?: TRange<1, 26>
    }
  | {
      /**
       * Show table pagination. Default is false.
       */
      showPagination?: false
      pageSize?: never
    }

type SubscriptionFields =
  | {
      /**
       * Subscriptions id - Use to fetch subscriptions and shows its orders
       */
      id?: string
      type?: 'subscriptions'
    }
  | {
      id?: never
      type?: 'orders'
    }

type Props = {
  /**
   * Type of list to render
   */
  type?: TOrderList
  /**
   * Children components to render
   */
  children: DefaultChildrenType
  /**
   * Columns to show
   */
  columns: OrderListColumn<TOrderList>[]
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
   * Show actions column. Default is false.
   */
  showActions?: boolean
  /**
   * Sort by column. Default is `number` column descending.
   */
  sortBy?: SortingState
  /**
   * Class name to assign to pagination container.
   */
  paginationContainerClassName?: string

  // sortBy?:
  /**
   * Class name to assign to the table header.
   */
  theadClassName?: string
  /**
   * Class name to assign to the table row.
   */
  rowTrClassName?: string
} & Omit<JSX.IntrinsicElements['table'], 'children'> &
  PaginationProps &
  SubscriptionFields

export function OrderList({
  id,
  type = 'orders',
  children,
  columns,
  loadingElement,
  showActions = false,
  showPagination = false,
  sortBy = [{ id: 'number', desc: true }],
  pageSize = 10,
  paginationContainerClassName,
  actionsComponent,
  actionsContainerClassName,
  theadClassName,
  rowTrClassName,
  ...p
}: Props): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>(sortBy)
  const [{ pageIndex, pageSize: currentPageSize }, setPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize
    })
  const { orders, subscriptions, getCustomerOrders, getCustomerSubscriptions } =
    useContext(CustomerContext)
  useEffect(() => {
    if (type === 'orders' && getCustomerOrders != null) {
      getCustomerOrders({
        pageNumber: pageIndex + 1,
        pageSize: currentPageSize as QueryPageSize
      })
    }
    if (type === 'subscriptions' && getCustomerSubscriptions != null) {
      getCustomerSubscriptions({
        pageNumber: pageIndex + 1,
        pageSize: currentPageSize as QueryPageSize,
        id
      })
    }
  }, [pageIndex, currentPageSize, id != null])
  const data = useMemo(() => {
    if (type === 'orders') {
      return orders ?? []
    }

    if (id == null) {
      return subscriptions ?? []
    }

    if (subscriptions?.[0]?.type === 'orders') {
      return subscriptions
    }

    return []
  }, [orders, subscriptions])
  const cols = useMemo<ColumnDef<OrderListContent<TOrderList>>[]>(
    () => columns,
    [columns]
  )
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize: currentPageSize
    }),
    [pageIndex, currentPageSize]
  )
  const pageCount = orders?.pageCount ?? subscriptions?.pageCount ?? -1
  const table = useReactTable<OrderListContent<TOrderList>>({
    data,
    columns: cols,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination
  })
  const TableHtmlElement = 'table'
  const TheadHtmlElement = 'thead'
  const TbodyHtmlElement = 'tbody'
  const ThHtmlElement = 'th'
  const TrHtmlElement = 'tr'

  useEffect(() => {
    if (type === 'orders' && orders != null) {
      setLoading(false)
    }
    if (type === 'subscriptions' && subscriptions != null) {
      setLoading(false)
    }
    return () => {
      setLoading(true)
    }
  }, [orders, subscriptions])
  const LoadingComponent = loadingElement || <div>Loading...</div>
  const headerComponent = table.getHeaderGroups().map((headerGroup) => {
    const columnsComponents = headerGroup.headers.map((header, k) => {
      const sortLabel =
        header.column.getIsSorted() !== false ? header.column.getIsSorted() : ''
      return (
        <ThHtmlElement
          data-testid={`thead-${k}`}
          data-sort={`${sortLabel || ''}`}
          key={header.id}
          className={columns[k]?.className}
        >
          <span
            {...{
              className: `${columns[k]?.titleClassName ?? ''} ${
                header.column.getCanSort() ? 'cursor-pointer select-none' : ''
              }`,
              onClick: header.column.getToggleSortingHandler()
            }}
          >
            {
              flexRender(
                header.column.columnDef.header,
                header.getContext()
              ) as ReactNode
            }
            {{
              asc: sortAscIcon,
              desc: sortDescIcon
            }[header.column.getIsSorted() as string] ?? null}
          </span>
        </ThHtmlElement>
      )
    })
    return (
      <TrHtmlElement key={headerGroup.id}>{columnsComponents}</TrHtmlElement>
    )
  })
  const rowsComponents = filterChildren({
    children,
    filterBy: rowComponents,
    componentName: 'OrderList'
  })
  const components = table.getRowModel().rows.map((row) => {
    const childProps = {
      type,
      orders: type === 'orders' ? orders : subscriptions,
      order: row.original,
      row,
      showActions,
      actionsComponent,
      actionsContainerClassName
    }
    return (
      <TrHtmlElement className={rowTrClassName} key={row.id}>
        <OrderListChildrenContext.Provider value={childProps}>
          {rowsComponents}
        </OrderListChildrenContext.Provider>
      </TrHtmlElement>
    )
  })
  const pagComponents = filterChildren({
    children,
    filterBy: paginationComponents,
    componentName: 'OrderList'
  })
  const totalRows =
    type === 'orders'
      ? orders?.meta.recordCount ?? 0
      : subscriptions?.meta.recordCount ?? 0

  const Pagination = (): JSX.Element | null =>
    !showPagination ? null : (
      <OrderListPagination.Provider
        value={{
          canNextPage: table.getCanNextPage(),
          canPreviousPage: table.getCanPreviousPage(),
          gotoPage: table.setPageIndex,
          nextPage: table.nextPage,
          pageCount: table.getPageCount(),
          pageIndex: table.getState().pagination.pageIndex,
          pageOptions: table.getPageOptions(),
          pageSize: table.getState().pagination.pageSize,
          previousPage: table.previousPage,
          setPageSize: table.setPageSize,
          totalRows
        }}
      >
        {pagComponents}
      </OrderListPagination.Provider>
    )
  if (loading && (orders == null || subscriptions == null)) {
    return <>{LoadingComponent}</>
  }
  return (type === 'orders' ? orders : subscriptions)?.length === 0 ? (
    <OrderListChildrenContext.Provider
      value={{ orders: type === 'orders' ? orders : subscriptions }}
    >
      {rowsComponents}
      <Pagination />
    </OrderListChildrenContext.Provider>
  ) : (
    <>
      <TableHtmlElement {...p}>
        <TheadHtmlElement className={theadClassName}>
          {headerComponent}
        </TheadHtmlElement>
        <TbodyHtmlElement>{components}</TbodyHtmlElement>
      </TableHtmlElement>
      {totalRows <= pageSize ? null : (
        <div className={paginationContainerClassName}>
          <Pagination />
        </div>
      )}
    </>
  )
}

export default OrderList
