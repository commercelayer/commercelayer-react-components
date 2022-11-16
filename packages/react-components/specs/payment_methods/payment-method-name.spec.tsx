import PaymentMethodName from '#components/payment_methods/PaymentMethodName'
import { render } from '@testing-library/react'
import { OrderContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('PaymentMethodName component', () => {
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
  it('PaymentMethodName outside of PaymentMethod', () => {
    expect(() => render(<PaymentMethodName />)).toThrow(
      'Cannot use <PaymentMethodName/> outside of <PaymentMethod/>'
    )
  })
})
