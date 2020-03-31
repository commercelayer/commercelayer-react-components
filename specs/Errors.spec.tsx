import React from 'react'
import { Errors } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.Errors.props

test('<Errors/>', () => {
  expect.assertions(5)
  const component = renderer.create(<Errors resourceKey="order" />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.messages).toBe(propTypes.messages)
  expect(proptypes.field).toBe(propTypes.field)
  expect(proptypes.resourceKey).toBe(propTypes.resourceKey)
})

test('<Errors proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<Errors />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `resourceKey` is marked as required in `CLErrors`, but its value is `undefined`'
    )
  )
})

test('<Errors proptypes validation />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  // @ts-ignore
  const component = renderer.create(<Errors resourceKey="test" />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: Invalid prop `resourceKey` of value `test` supplied to `CLErrors`, expected one of ["order","giftCard","lineItem","variant","price","skuOption"]'
    )
  )
})

test('<Errors with custom children />', () => {
  expect.assertions(5)
  const CustomComponent = props => <span>{props.label}</span>
  const component = renderer.create(
    <Errors resourceKey="lineItem" field="quantity">
      {CustomComponent}
    </Errors>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const parentRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe(CustomComponent)
  expect(parentRendered.nodeType).toBe('component')
  expect(parentRendered.type).toBe(CustomComponent)
  expect(parentRendered.props).toEqual({
    messages: [],
    resourceKey: 'lineItem',
    field: 'quantity',
    children: CustomComponent
  })
})
