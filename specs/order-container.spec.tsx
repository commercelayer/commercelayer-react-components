import CommerceLayer from '#components/auth/CommerceLayer'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemsCount from '#components/line_items/LineItemsCount'
import OrderContainer from '#components/orders/OrderContainer'
import { render, screen } from '@testing-library/react'
import { OrderContext } from './utils/context'
import getToken from './utils/getToken'

describe('AddToCartButton component', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      token = accessToken
      domain = endpoint
    }
  })
  beforeEach<OrderContext>(async (ctx) => {
    if (token != null && domain != null) {
      ctx.accessToken = token
      ctx.endpoint = domain
      ctx.orderId = 'NrnYhAdEkx'
    }
  })
  it<OrderContext>('Show custom loader if it is available', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer
          orderId={ctx.orderId}
          loader={<span data-testid='loading'>Loading...</span>}
        >
          <LineItemsContainer>
            <LineItemsCount />
          </LineItemsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    expect(screen.findByText('Loading...'))
    expect(screen.queryByText('Loading...')).toBeNull()
  })
  it('OrderContainer outside of CommerceLayer', () => {
    expect(() =>
      render(
        <OrderContainer>
          <></>
        </OrderContainer>
      )
    ).toThrow('Cannot use `OrderContainer` outside of `CommerceLayer`')
  })
})
