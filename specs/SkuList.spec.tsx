import React from 'react'
import { SkuList, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.SkuList.propTypes

test('<SkuList/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <SkuList id="unit-test">
      <div>test</div>
    </SkuList>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.id).toBe(propTypes.id)
})

test('<SkuList proptypes required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<SkuList />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'SkuList', but its value is 'undefined'.`
    )
  )
  expect(console.error.mock.calls[1][2]).toEqual(
    expect.stringContaining(
      'The prop `id` is marked as required in `SkuList`, but its value is `undefined`.'
    )
  )
})

test('<SkuList check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <SkuList id="unit-id">
      <Price />
    </SkuList>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to SkuList. Only components AddToCartButton, QuantitySelector,  are allowed.`
    )
  )
})
