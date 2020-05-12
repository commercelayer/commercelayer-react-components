import React from 'react'
import { LineItemOptions, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.LineItemOptions.propTypes

test('<LineItemOptions/>', () => {
  expect.assertions(4)
  const component = renderer.create(
    <LineItemOptions skuOptionId="test">
      <div>test</div>
    </LineItemOptions>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.skuOptionId).toBe(propTypes.skuOptionId)
  expect(proptypes.showName).toBe(propTypes.showName)
})

test('<LineItemOptions proptypes required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<LineItemOptions />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      "Warning: Failed prop type: The prop 'children' is marked as required in 'LineItemOptions', but its value is 'undefined'"
    )
  )
  expect(console.error.mock.calls[1][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `skuOptionId` is marked as required in `LineItemOptions`, but its value is `undefined`'
    )
  )
})

test('<LineItemOptions check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <LineItemOptions skuOptionId="unit-test">
      <Price />
    </LineItemOptions>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to LineItemOptions. Only components LineItemOption, ReactNode are allowed.`
    )
  )
})
