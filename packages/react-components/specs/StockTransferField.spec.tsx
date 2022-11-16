import React from 'react'
import { StockTransferField } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'
import Parent from '../#components/utils/Parent'

const propTypes = components.StockTransferField.propTypes

test('<StockTransferField/>', () => {
  expect.assertions(4)
  console.error = jest.fn()
  const component = renderer.create(<StockTransferField />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.type).toBe(propTypes.type)
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      'The prop `type` is marked as required in `StockTransferField`, but its value is `undefined`.'
    )
  )
})

test('<StockTransferField check children format />', () => {
  expect.assertions(3)
  const component = renderer.create(<StockTransferField type="quantity" />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('p')
  expect(root.props.type).toBe('quantity')
})

test('<StockTransferField with custom children />', () => {
  expect.assertions(6)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <StockTransferField>{CustomComponent}</StockTransferField>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.rendered.nodeType).toBe('host')
  expect(childRendered.rendered.type).toBe('span')
})
