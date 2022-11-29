import CommerceLayer from '#components/auth/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import OrderList, { OrderListColumn } from '#components/orders/OrderList'
import OrderListEmpty from '#components/orders/OrderListEmpty'
import OrderListPaginationButtons from '#components/orders/OrderListPaginationButtons'
import { OrderListPaginationInfo } from '#components/orders/OrderListPaginationInfo'
import OrderListRow from '#components/orders/OrderListRow'
import { Order } from '@commercelayer/sdk'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@testing-library/react'
import { LocalContext } from '../utils/context'
import getToken from '../utils/getToken'

interface OrderListContext extends Omit<LocalContext, 'sku' | 'skus'> {
  columns: Array<{
    Header: string
    accessor: keyof Order
    className?: string
    titleClassName?: string
  }>
}

const columns: OrderListColumn[] = [
  {
    Header: 'Order',
    accessor: 'number'
  },
  {
    Header: 'Status',
    accessor: 'status'
  },
  {
    Header: 'Date',
    accessor: 'updated_at'
  },
  {
    Header: 'Amount',
    accessor: 'formatted_total_amount_with_taxes'
  }
]

describe('Orders list', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      token = accessToken
      domain = endpoint
    }
  })
  beforeEach<OrderListContext>(async (ctx) => {
    if (token != null && domain != null) {
      ctx.accessToken = token
      ctx.endpoint = domain
      ctx.columns = columns
    }
  })
  it<OrderListContext>('Show orders list', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={ctx.columns}>
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    const [first] = screen.getAllByTestId(/thead/)
    expect(first).toBeDefined()
    expect(first?.getAttribute('data-testid')).toBe('thead-0')
    expect(screen.getByText('Order')).toBeDefined()
    expect(first?.getAttribute('data-sort')).toBe('')
    fireEvent.click(screen.getByText('Order'))
    expect(first?.getAttribute('data-sort')).toBe('asc')
    fireEvent.click(screen.getByText('Order'))
    expect(first?.getAttribute('data-sort')).toBe('desc')
    const [firstCell] = screen.getAllByTestId(/cell/)
    expect(firstCell).toBeDefined()
    expect(firstCell?.getAttribute('data-testid')).toBe('cell-0')
    expect(first?.textContent).not.toBe('')
  })
  it<OrderListContext>('Show orders list empty', async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer_empty')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={ctx.columns}>
            <OrderListEmpty />
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    expect(screen.getByText('No orders available'))
  })
  it<OrderListContext>('Show orders list empty with custom component', async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer_empty')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={ctx.columns}>
            <OrderListEmpty>
              {() => <>There are not any orders available</>}
            </OrderListEmpty>
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    expect(screen.getByText('There are not any orders available'))
  })
  it<OrderListContext>('Show orders list with custom loading even if there is OrderListEmpty', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList
            columns={ctx.columns}
            loadingElement={<>Custom loading...</>}
          >
            <OrderListEmpty />
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Custom loading...'))
    await waitForElementToBeRemoved(
      () => screen.queryByText('Custom loading...'),
      {
        timeout: 5000
      }
    )
    const [first] = screen.getAllByTestId(/thead/)
    expect(first).toBeDefined()
    expect(first?.getAttribute('data-testid')).toBe('thead-0')
    expect(first?.textContent).not.toBe('')
    expect(first?.tagName).toBe('TH')
    expect(screen.getByText('Order')).toBeDefined()
    const [firstCell] = screen.getAllByTestId(/cell/)
    expect(firstCell).toBeDefined()
    expect(firstCell?.getAttribute('data-testid')).toBe('cell-0')
    expect(firstCell?.tagName).toBe('TD')
    expect(firstCell?.textContent).not.toBe('')
  })
  it<OrderListContext>('Show orders list with actions and custom Order list row', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList
            columns={ctx.columns}
            showActions
            actionsComponent={() => <>Actions</>}
            actionsContainerClassName='action-container-class'
          >
            <OrderListEmpty />
            <OrderListRow field='number'>
              {({ cell, order, infiniteScroll, ...p }) => {
                return (
                  <>
                    {cell?.map((cell, k) => {
                      return (
                        <td
                          {...p}
                          {...cell.getCellProps()}
                          className='py-5 border-b'
                          key={k}
                          data-testid={`custom-cell-${k}`}
                        >
                          <p className='font-bold'>
                            Order # {cell.render('Cell')}
                          </p>
                          <p className='text-xs text-gray-500'>
                            contains {order.skus_count} items
                          </p>
                        </td>
                      )
                    })}
                  </>
                )
              }}
            </OrderListRow>
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    const [first] = screen.getAllByTestId(/thead/)
    expect(first).toBeDefined()
    expect(first?.getAttribute('data-testid')).toBe('thead-0')
    expect(first?.textContent).not.toBe('')
    expect(first?.tagName).toBe('TH')
    expect(screen.getByText('Order')).toBeDefined()
    const [firstCell] = screen.getAllByTestId(/cell/)
    expect(firstCell).toBeDefined()
    expect(firstCell?.getAttribute('data-testid')).toBe('custom-cell-0')
    expect(firstCell?.tagName).toBe('TD')
    expect(firstCell?.textContent).not.toBe('')
    expect(firstCell?.textContent).toContain('Order #')
    const [action] = screen.getAllByTestId('action-cell')
    expect(action).toBeDefined()
    expect(action?.getAttribute('data-testid')).toBe('action-cell')
    expect(action?.className).toBe('action-container-class')
  })
  it<OrderListContext>('Show orders list with infinite scroll', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={ctx.columns} infiniteScroll>
            <OrderListEmpty />
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    const [first] = screen.getAllByTestId(/thead/)
    expect(first).toBeDefined()
    expect(first?.getAttribute('data-testid')).toBe('thead-0')
    expect(first?.tagName).toBe('DIV')
    expect(screen.getByText('Order')).toBeDefined()
    expect(first?.textContent).not.toBe('')
    const [firstCell] = screen.getAllByTestId(/cell/)
    expect(firstCell).toBeDefined()
    expect(firstCell?.getAttribute('data-testid')).toBe('cell-0')
    expect(firstCell?.tagName).toBe('DIV')
    expect(firstCell?.textContent).not.toBe('')
  })
  it<OrderListContext>('Show orders list with infinite scroll with windowOptions', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList
            columns={ctx.columns}
            infiniteScroll
            windowOptions={{
              column: 200,
              height: 500,
              itemSize: 200,
              width: 400
            }}
          >
            <OrderListEmpty />
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    const [first] = screen.getAllByTestId(/thead/)
    expect(first).toBeDefined()
    expect(first?.getAttribute('data-testid')).toBe('thead-0')
    expect(first?.tagName).toBe('DIV')
    expect(screen.getByText('Order')).toBeDefined()
    expect(first?.textContent).not.toBe('')
    expect(first?.getAttribute('data-sort')).toBe('')
    fireEvent.click(screen.getByText('Order'))
    expect(first?.getAttribute('data-sort')).toBe('asc')
    fireEvent.click(screen.getByText('Order'))
    expect(first?.getAttribute('data-sort')).toBe('desc')
    const [firstCell] = screen.getAllByTestId(/cell/)
    expect(firstCell).toBeDefined()
    expect(firstCell?.getAttribute('data-testid')).toBe('cell-0')
    expect(firstCell?.tagName).toBe('DIV')
    expect(firstCell?.textContent).not.toBe('')
  })
  it<OrderListContext>('Show orders list with pagination', async (ctx) => {
    const { rerender } = render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={ctx.columns} showPagination>
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
            <OrderListPaginationInfo data-testid='pagination-info' />
            <OrderListPaginationButtons
              navigationButtons={{ activeClassName: 'active' }}
            />
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 8000
    })
    const [first] = screen.getAllByTestId(/thead/)
    expect(first).toBeDefined()
    expect(first?.getAttribute('data-testid')).toBe('thead-0')
    expect(screen.getByText('Order')).toBeDefined()
    expect(first?.getAttribute('data-sort')).toBe('')
    fireEvent.click(screen.getByText('Order'))
    expect(first?.getAttribute('data-sort')).toBe('asc')
    fireEvent.click(screen.getByText('Order'))
    expect(first?.getAttribute('data-sort')).toBe('desc')
    const [firstCell] = screen.getAllByTestId(/cell/)
    expect(firstCell).toBeDefined()
    expect(firstCell?.getAttribute('data-testid')).toBe('cell-0')
    expect(first?.textContent).not.toBe('')
    let paginationInfo = screen.getByTestId('pagination-info')
    expect(paginationInfo?.tagName).toBe('SPAN')
    expect(paginationInfo?.textContent).toContain('1 - 10')
    // TODO: check disabled
    let prevButton = screen.getByTestId('prev-button')
    expect(prevButton).toBeDefined()
    expect(prevButton.textContent).toBe('<')
    let nextButton = screen.getByTestId('next-button')
    expect(nextButton).toBeDefined()
    expect(nextButton.textContent).toBe('>')
    let navButtons = screen.getAllByTestId(/page-/)
    expect(navButtons).toBeDefined()
    expect(navButtons.length).toBe(3)
    expect(navButtons[0]?.className).toContain('active')
    fireEvent.click(nextButton)
    await waitFor(async () => await screen.findByText(/11 - 20/), {
      timeout: 2000
    })
    paginationInfo = screen.getByTestId('pagination-info')
    expect(paginationInfo?.textContent).toContain('11 - 20')
    navButtons = screen.getAllByTestId(/page-/)
    expect(navButtons).toBeDefined()
    expect(navButtons.length).toBe(3)
    nextButton = screen.getByTestId('next-button')
    fireEvent.click(nextButton)
    await waitFor(async () => await screen.findByText(/21 - 30/), {
      timeout: 2000
    })
    paginationInfo = screen.getByTestId('pagination-info')
    expect(paginationInfo?.textContent).toContain('21 - 30')
    navButtons = screen.getAllByTestId(/page-/)
    expect(navButtons).toBeDefined()
    expect(navButtons.length).toBe(3)
    expect(navButtons[1]?.className).toContain('active')
    prevButton = screen.getByTestId('prev-button')
    fireEvent.click(prevButton)
    await waitFor(async () => await screen.findByText(/11 - 20/), {
      timeout: 2000
    })
    paginationInfo = screen.getByTestId('pagination-info')
    expect(paginationInfo?.textContent).toContain('11 - 20')
    navButtons = screen.getAllByTestId(/page-/)
    expect(navButtons).toBeDefined()
    expect(navButtons.length).toBe(3)
    expect(navButtons[1]?.className).toContain('active')
    prevButton = screen.getByTestId('prev-button')
    fireEvent.click(prevButton)
    await waitFor(async () => await screen.findByText(/1 - 10/), {
      timeout: 2000
    })
    paginationInfo = screen.getByTestId('pagination-info')
    expect(paginationInfo?.textContent).toContain('1 - 10')
    navButtons = screen.getAllByTestId(/page-/)
    expect(navButtons).toBeDefined()
    expect(navButtons.length).toBe(3)
    expect(navButtons[0]?.className).toContain('active')
    const page = screen.getByTestId('page-3')
    fireEvent.click(page)
    await waitFor(async () => await screen.findByText(/21 - 30/), {
      timeout: 2000
    })
    paginationInfo = screen.getByTestId('pagination-info')
    expect(paginationInfo?.textContent).toContain('21 - 30')
    navButtons = screen.getAllByTestId(/page-/)
    expect(navButtons).toBeDefined()
    expect(navButtons.length).toBe(3)
    expect(navButtons[1]?.className).toContain('active')
    rerender(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={ctx.columns} showPagination>
            <OrderListRow field='number' />
            <OrderListRow field='status' className='align-top py-5 border-b' />
            <OrderListRow
              field='updated_at'
              className='align-top py-5 border-b'
            />
            <OrderListRow
              field='formatted_total_amount_with_taxes'
              className='align-top py-5 border-b font-bold'
            />
            <OrderListPaginationInfo data-testid='pagination-info'>
              {(props) => (
                <span data-testid='custom-pagination-info'>
                  {props.firstRow} - {props.lastRow}
                </span>
              )}
            </OrderListPaginationInfo>
            <OrderListPaginationButtons
              navigationButtons={{ show: false }}
              previousPageButton={{ show: false }}
              nextPageButton={{ show: false }}
            >
              {(props) => (
                <span data-testid='custom-pagination-button'>
                  {props.pageIndex}
                </span>
              )}
            </OrderListPaginationButtons>
          </OrderList>
        </CustomerContainer>
      </CommerceLayer>
    )
    paginationInfo = screen.getByTestId('custom-pagination-info')
    expect(paginationInfo?.textContent).toContain('21 - 30')
    const customPaginationCustom = screen.getByTestId(
      'custom-pagination-button'
    )
    expect(customPaginationCustom?.textContent).toContain('2')
  }, 12000)
  it<OrderListContext>('Wrong component as children into <OrderList/>', async (ctx) => {
    expect(() =>
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <CustomerContainer>
            <OrderList columns={ctx.columns} showPagination>
              <OrderListRow field='number' />
              <OrderListRow
                field='status'
                className='align-top py-5 border-b'
              />
              <OrderListRow
                field='updated_at'
                className='align-top py-5 border-b'
              />
              <OrderListRow
                field='formatted_total_amount_with_taxes'
                className='align-top py-5 border-b font-bold'
              />
              <div>wrong element</div>
              <OrderListPaginationInfo data-testid='pagination-info' />
            </OrderList>
          </CustomerContainer>
        </CommerceLayer>
      )
    ).toThrow('Only library components are allowed into <OrderList/>')
  })
})
