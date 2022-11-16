import OrderContainer from '#components/orders/OrderContainer'
import { render } from '@testing-library/react'
import { OrderContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('OrderContainer component', () => {
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
