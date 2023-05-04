import OrderContainer from '#components/orders/OrderContainer'
import { render } from '@testing-library/react'

describe('OrderContainer component', () => {
  it('OrderContainer outside of CommerceLayer', () => {
    expect(() =>
      render(
        <OrderContainer>
          <></>
        </OrderContainer>
      )
    ).toThrow('Cannot use <OrderContainer/> outside of <CommerceLayer/>')
  })
})
