import PaymentMethod from '#components/payment_methods/PaymentMethod'
import { render } from '@testing-library/react'

describe('PaymentMethod component', () => {
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
