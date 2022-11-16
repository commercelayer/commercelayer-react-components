import React from 'react'
import { ItemContainer, Price, PricesContainer } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.ItemContainer.propTypes

test('<ItemContainer/>', () => {
  expect.assertions(4)
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
  expect(proptypes.lineItem).toBe(propTypes.lineItem)
})

test('<ItemContainer proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<ItemContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'ItemContainer', but its value is 'undefined'.`
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
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to ItemContainer. Only components PricesContainer, VariantsContainer, SkuOptionContainer, QuantitySelector, AddToCartButton, AvailabilityContainer, SkuListsContainer, ReactNode are allowed.`
    )
  )
})
