import CommerceLayer from '#components/auth/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import OrderList, { OrderListColumn } from '#components/orders/OrderList'
import OrderListRow from '#components/orders/OrderListRow'
import { Order } from '@commercelayer/sdk'
import { render, screen, waitFor } from '@testing-library/react'
import { LocalContext } from './utils/context'
import getToken from './utils/getToken'

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
  beforeEach<OrderListContext>(async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
  })
  it<LocalContext>('Show orders list', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <OrderList columns={columns}>
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
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull()
    })
    const theadOrder = await screen.findByText('Order')
    // const compare = screen.queryByTestId(`compare-${ctx.sku}`)
    expect(theadOrder.textContent).not.toBe('')
    expect(theadOrder.textContent).toBe('Order')
    // expect(compare?.textContent).not.toBe('')
  })
})
