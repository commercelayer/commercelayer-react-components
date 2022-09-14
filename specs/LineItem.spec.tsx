import React from 'react'
import { LineItem, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.LineItem.propTypes

test('<LineItem/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <LineItem>
      <div>test</div>
    </LineItem>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.type).toBe(propTypes.type)
})

test('<LineItem proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<LineItem />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'LineItem', but its value is 'undefined'.`
    )
  )
})

test('<LineItem check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <LineItem>
      <Price />
    </LineItem>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to LineItem. Only components LineItemImage, LineItemName, LineItemOptions, LineItemQuantity, LineItemAmount, LineItemRemoveLink, StockTransfer, Errors, ReactNode are allowed.`
    )
  )
})
