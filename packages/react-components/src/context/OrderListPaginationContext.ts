import { createContext } from 'react'
import { Row } from 'react-table'

export interface OrderListPaginationContext {
  canNextPage: boolean
  canPreviousPage: boolean
  gotoPage: (page: number) => void
  nextPage: () => void
  page: Row[]
  pageCount: number
  pageIndex: number
  pageNumber: number
  pageOptions: number[]
  pageSize: number
  previousPage: () => void
  setPageSize: (pageCount: number) => void
  totalRows: number
}

const ctx = createContext<OrderListPaginationContext | null>(null)

export default ctx
