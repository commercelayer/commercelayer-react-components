import React from 'react'
import { SkuOption, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.SkuOption.propTypes

test('<SkuOption/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <SkuOption name="unit-test">
      <div>test</div>
    </SkuOption>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.name).toBe(propTypes.name)
})

test('<SkuOption proptypes required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<SkuOption />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'SkuOption', but its value is 'undefined'.`
    )
  )
  expect(console.error.mock.calls[1][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `name` is marked as required in `SkuOption`, but its value is `undefined`.'
    )
  )
})

test('<SkuOption check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <SkuOption>
      <Price />
    </SkuOption>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to SkuOption. Only components SkuOptionInput, ReactNode are allowed.`
    )
  )
})
