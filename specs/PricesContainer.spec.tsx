import React from 'react'
import { PricesContainer, CheckoutLink } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.PricesContainer.propTypes

test('<PricesContainer/>', () => {
  expect.assertions(6)
  const component = renderer.create(
    <PricesContainer>
      <div>test</div>
    </PricesContainer>
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

test('<PricesContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <PricesContainer>
      <CheckoutLink />
    </PricesContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to PricesContainer. Only components Price,  are allowed.`
    )
  )
})
