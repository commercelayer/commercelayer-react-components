import PlaceOrderContainer from '#components/orders/PlaceOrderContainer'
import { render } from '@testing-library/react'

describe('PlaceOrderContainer component', () => {
  it('PlaceOrderContainer outside of OrderContainer', () => {
    expect(() =>
      render(
        <PlaceOrderContainer>
          <></>
        </PlaceOrderContainer>
      )
    ).toThrow('Cannot use <PlaceOrderContainer/> outside of <OrderContainer/>')
  })
})
