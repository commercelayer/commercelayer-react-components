import React from 'react'
import { OrderContainer, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.OrderContainer.propTypes

test('<OrderContainer/>', () => {
  expect.assertions(5)
  const component = renderer.create(
    <OrderContainer>
      <div>test</div>
    </OrderContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.metadata).toBe(propTypes.metadata)
  expect(proptypes.attributes).toBe(propTypes.attributes)
  expect(proptypes.orderId).toBe(propTypes.orderId)
})

test('<OrderContainer proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<OrderContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'OrderContainer', but its value is 'undefined'.`
    )
  )
})

test('<OrderContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <OrderContainer>
      <Price />
    </OrderContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to OrderContainer. Only components AddressesContainer, CustomerContainer, ItemContainer, LineItemsContainer, SubTotalAmount, DiscountAmount, ShippingAmount, TaxesAmount, GiftCardAmount, TotalAmount, CheckoutLink, GiftCardContainer, ReactNode are allowed.`
    )
  )
})
