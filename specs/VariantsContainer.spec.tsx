import React from 'react'
import { VariantsContainer, CheckoutLink } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.VariantsContainer.propTypes

test('<VariantsContainer/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <VariantsContainer>
      <div>test</div>
    </VariantsContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
})

test('<VariantsContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <VariantsContainer>
      <CheckoutLink />
    </VariantsContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to VariantsContainer. Only components VariantSelector, ReactNode are allowed.`
    )
  )
})
