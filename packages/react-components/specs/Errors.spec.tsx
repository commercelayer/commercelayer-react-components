import React from 'react'
import { Errors } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.Errors.propTypes

test('<Errors/>', () => {
  expect.assertions(5)
  const component = renderer.create(<Errors resource="order" />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.messages).toBe(propTypes.messages)
  expect(proptypes.field).toBe(propTypes.field)
  expect(proptypes.resource).toBe(propTypes.resource)
})

test('<Errors proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<Errors />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      'The prop `resource` is marked as required in `Errors`, but its value is `undefined`'
    )
  )
})

test('<Errors proptypes validation />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  // @ts-ignore
  const component = renderer.create(<Errors resource="test" />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      'Invalid prop `resource` of value `test` supplied to `Errors`, expected one of ["order","giftCard","lineItem","variant","price","skuOption","billingAddress","shippingAddress"]'
    )
  )
})

test('<Errors with custom children />', () => {
  expect.assertions(5)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <Errors resource="lineItem" field="quantity">
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
    resource: 'lineItem',
    field: 'quantity',
    children: CustomComponent,
  })
})
