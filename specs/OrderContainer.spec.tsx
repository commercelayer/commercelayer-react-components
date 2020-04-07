import React from 'react'
import { OrderContainer, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.OrderContainer.propTypes

test('<OrderContainer/>', () => {
  expect.assertions(4)
  const component = renderer.create(
    <OrderContainer persistKey="unit-test">
      <div>test</div>
    </OrderContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.persistKey).toBe(propTypes.persistKey)
  expect(proptypes.metadata).toBe(propTypes.metadata)
})

test('<OrderContainer proptypes required />', () => {
  // expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<OrderContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'OrderContainer', but its value is 'undefined'.`
    )
  )
  expect(console.error.mock.calls[1][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `persistKey` is marked as required in `OrderContainer`, but its value is `undefined`.'
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
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to OrderContainer. Only components ItemContainer, LineItemsContainer, SubTotal, Discount, Shipping, Taxes, GiftCardPrice, Total, Checkout, GiftCardContainer, ReactNode are allowed.`
    )
  )
})
