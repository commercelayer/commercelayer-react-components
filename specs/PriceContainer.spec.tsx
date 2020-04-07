import React from 'react'
import { PriceContainer, Checkout } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.PriceContainer.propTypes

test('<PriceContainer/>', () => {
  expect.assertions(6)
  const component = renderer.create(
    <PriceContainer>
      <div>test</div>
    </PriceContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.perPage).toBe(propTypes.perPage)
  expect(proptypes.filters).toBe(propTypes.filters)
  expect(proptypes.loader).toBe(propTypes.loader)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
})

test('<PriceContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <PriceContainer>
      <Checkout />
    </PriceContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to PriceContainer. Only components Price, ReactNode are allowed.`
    )
  )
})
