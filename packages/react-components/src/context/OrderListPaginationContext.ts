import { createContext } from 'react'

export interface OrderListPaginationContext {
  canNextPage: boolean
  canPreviousPage: boolean
  gotoPage: (page: number) => void
  nextPage: () => void
  pageCount: number
  pageIndex: number
  pageOptions: number[]
  pageSize: number
  previousPage: () => void
  setPageSize: (pageCount: number) => void
  totalRows: number
}

const ctx = createContext<OrderListPaginationContext | null>(null)

export default ctx
