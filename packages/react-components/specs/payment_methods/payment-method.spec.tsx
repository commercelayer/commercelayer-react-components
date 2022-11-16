import PaymentMethod from '#components/payment_methods/PaymentMethod'
import { render } from '@testing-library/react'
import { OrderContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('PaymentMethod component', () => {
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
  it('PaymentMethod outside of PaymentMethodsContainer', () => {
    expect(() =>
      render(
        <PaymentMethod>
          <></>
        </PaymentMethod>
      )
    ).toThrow(
      'Cannot use <PaymentMethod/> outside of <PaymentMethodsContainer/>'
    )
  })
})
