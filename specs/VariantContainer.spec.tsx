import React from 'react'
import { VariantContainer, Checkout } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.VariantContainer.propTypes

test('<VariantContainer/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <VariantContainer>
      <div>test</div>
    </VariantContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
})

test('<VariantContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <VariantContainer>
      <Checkout />
    </VariantContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to VariantContainer. Only components VariantSelector, ReactNode are allowed.`
    )
  )
})
