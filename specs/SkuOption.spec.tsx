import React from 'react'
import { SkuOption, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.SkuOption.propTypes

test('<SkuOption/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <SkuOption id="unit-test">
      <div>test</div>
    </SkuOption>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.id).toBe(propTypes.id)
})

test('<SkuOption proptypes required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<SkuOption />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'SkuOption', but its value is 'undefined'.`
    )
  )
  expect(console.error.mock.calls[1][2]).toEqual(
    expect.stringContaining(
      'The prop `id` is marked as required in `SkuOption`, but its value is `undefined`.'
    )
  )
})

test('<SkuOption check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <SkuOption id="unit-id">
      <Price />
    </SkuOption>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to SkuOption. Only components SkuOptionInput,  are allowed.`
    )
  )
})
