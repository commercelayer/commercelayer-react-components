import PaymentMethodRadioButton from '#components/payment_methods/PaymentMethodRadioButton'
import { render } from '@testing-library/react'
import { OrderContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('PaymentMethodRadioButton component', () => {
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
  it('PaymentMethodRadioButton outside of PaymentMethod', () => {
    expect(() => render(<PaymentMethodRadioButton />)).toThrow(
      'Cannot use <PaymentMethodRadioButton/> outside of <PaymentMethod/>'
    )
  })
})
