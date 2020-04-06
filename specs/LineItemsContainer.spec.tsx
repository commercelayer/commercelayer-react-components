import React from 'react'
import { LineItemsContainer, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.LineItemsContainer.propTypes

test('<LineItemsContainer/>', () => {
  expect.assertions(4)
  const component = renderer.create(
    <LineItemsContainer>
      <div>test</div>
    </LineItemsContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.filters).toBe(propTypes.filters)
  expect(proptypes.loader).toBe(propTypes.loader)
})

test('<LineItemsContainer proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<LineItemsContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'LineItemsContainer', but its value is 'undefined'.`
    )
  )
})

test('<LineItemsContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <LineItemsContainer>
      <Price />
    </LineItemsContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to LineItemsContainer. Only components LineItemsCount, LineItem, ReactNode are allowed.`
    )
  )
})
