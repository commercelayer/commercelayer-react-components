import React from 'react'
import { SkuOptionsContainer, CheckoutLink } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.SkuOptionsContainer.propTypes

test('<SkuOptionsContainer/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <SkuOptionsContainer>
      <div>test</div>
    </SkuOptionsContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
})

test('<SkuOptionsContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <SkuOptionsContainer>
      <CheckoutLink />
    </SkuOptionsContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to SkuOptionsContainer. Only components SkuOption,  are allowed.`
    )
  )
})
