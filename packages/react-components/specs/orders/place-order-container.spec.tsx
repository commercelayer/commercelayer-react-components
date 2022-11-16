import PlaceOrderContainer from '#components/orders/PlaceOrderContainer'
import { render } from '@testing-library/react'
import { OrderContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('PlaceOrderContainer component', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken()
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
  it('PlaceOrderContainer outside of OrderContainer', () => {
    expect(() =>
      render(
        <PlaceOrderContainer>
          <></>
        </PlaceOrderContainer>
      )
    ).toThrow('Cannot use <PlaceOrderContainer/> outside of <OrderContainer/>')
  })
})
