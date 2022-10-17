import PaymentMethodsContainer from '#components/payment_methods/PaymentMethodsContainer'
import { render } from '@testing-library/react'
import { OrderContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('PaymentMethodsContainer component', () => {
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
  it('PaymentMethodsContainer outside of OrderContainer', () => {
    expect(() =>
      render(
        <PaymentMethodsContainer>
          <></>
        </PaymentMethodsContainer>
      )
    ).toThrow(
      'Cannot use <PaymentMethodsContainer/> outside of <OrderContainer/>'
    )
  })
})
