import PaymentMethodsContainer from '#components/payment_methods/PaymentMethodsContainer'
import { render } from '@testing-library/react'

describe('PaymentMethodsContainer component', () => {
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
