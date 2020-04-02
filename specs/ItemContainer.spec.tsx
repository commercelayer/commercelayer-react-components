import React from 'react'
import { ItemContainer, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.ItemContainer.propTypes

test('<ItemContainer/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <ItemContainer>
      <div>test</div>
    </ItemContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
})

test('<ItemContainer proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<ItemContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'ItemContainer', but its value is 'undefined'.`
    )
  )
})

test('<ItemContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <ItemContainer>
      <Price />
    </ItemContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to ItemContainer. Only components PriceContainer, VariantContainer, SkuOptionContainer, QuantitySelector, AddToCart, AvailabilityContainer, ReactNode are allowed.`
    )
  )
})
