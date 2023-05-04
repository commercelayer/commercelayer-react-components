import PaymentMethodRadioButton from '#components/payment_methods/PaymentMethodRadioButton'
import { render } from '@testing-library/react'
import { type OrderContext } from '../utils/context'
import { getAccessToken } from 'mocks/getAccessToken'

describe('PaymentMethodRadioButton component', () => {
  beforeEach<OrderContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.orderId = 'NrnYhAdEkx'
    }
  })
  it('PaymentMethodRadioButton outside of PaymentMethod', () => {
    expect(() => render(<PaymentMethodRadioButton />)).toThrow(
      'Cannot use <PaymentMethodRadioButton/> outside of <PaymentMethod/>'
    )
  })
})
