import React from 'react'
import { OrderStorage, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.OrderStorage.propTypes

test('<OrderStorage/>', () => {
  expect.assertions(4)
  const component = renderer.create(
    <OrderStorage persistKey="unit-test">
      <div>test</div>
    </OrderStorage>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.persistKey).toBe(propTypes.persistKey)
  expect(proptypes.clearWhenPlaced).toBe(propTypes.clearWhenPlaced)
})

test('<OrderStorage proptypes required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<OrderStorage />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'OrderStorage', but its value is 'undefined'.`
    )
  )
  expect(console.error.mock.calls[1][2]).toEqual(
    expect.stringContaining(
      'The prop `persistKey` is marked as required in `OrderStorage`, but its value is `undefined`.'
    )
  )
})

test('<OrderStorage check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <OrderStorage>
      <Price />
    </OrderStorage>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to OrderStorage. Only components OrderContainer,  are allowed.`
    )
  )
})
