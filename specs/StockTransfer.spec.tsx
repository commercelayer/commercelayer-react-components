import React from 'react'
import { StockTransfer, Price } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.StockTransfer.propTypes

test('<StockTransfer/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <StockTransfer>
      <div>test</div>
    </StockTransfer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<StockTransfer proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<StockTransfer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'StockTransfer', but its value is 'undefined'.`
    )
  )
})

test('<StockTransfer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <StockTransfer>
      <Price />
    </StockTransfer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to StockTransfer. Only components StockTransferField, ReactNode are allowed.`
    )
  )
})
