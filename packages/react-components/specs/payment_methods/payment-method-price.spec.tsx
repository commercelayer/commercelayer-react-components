import PaymentMethodPrice from '#components/payment_methods/PaymentMethodPrice'
import { render } from '@testing-library/react'
import { type OrderContext } from '../utils/context'
import { getAccessToken } from 'mocks/getAccessToken'

describe('PaymentMethodPrice component', () => {
  beforeEach<OrderContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.orderId = 'NrnYhAdEkx'
    }
  })
  it('PaymentMethodPrice outside of PaymentMethod', () => {
    expect(() => render(<PaymentMethodPrice />)).toThrow(
      'Cannot use <PaymentMethodPrice/> outside of <PaymentMethod/>'
    )
  })
})
