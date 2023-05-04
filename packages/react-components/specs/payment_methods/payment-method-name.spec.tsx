import PaymentMethodName from '#components/payment_methods/PaymentMethodName'
import { render } from '@testing-library/react'
import { type OrderContext } from '../utils/context'
import { getAccessToken } from 'mocks/getAccessToken'

describe('PaymentMethodName component', () => {
  beforeEach<OrderContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.orderId = 'NrnYhAdEkx'
    }
  })
  it('PaymentMethodName outside of PaymentMethod', () => {
    expect(() => render(<PaymentMethodName />)).toThrow(
      'Cannot use <PaymentMethodName/> outside of <PaymentMethod/>'
    )
  })
})
