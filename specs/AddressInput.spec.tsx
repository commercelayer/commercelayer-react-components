import React from 'react'
import { AddressInput } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.AddressInput.propTypes

test('<AddressInput/>', () => {
  expect.assertions(5)
  const component = renderer.create(
    <AddressInput type="text" name="billing_address_first_name" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.type).toBe(propTypes.type)
  expect(proptypes.name).toBe(propTypes.name)
  expect(proptypes.placeholder).toBe(propTypes.placeholder)
})

test('<AddressInput check type required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<AddressInput />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      'The prop `name` is marked as required in `AddressInput`, but its value is `undefined`'
    )
  )
  expect(console.error.mock.calls[1][2]).toEqual(
    expect.stringContaining(
      'The prop `type` is marked as required in `AddressInput`, but its value is `undefined`'
    )
  )
})

test('<AddressInput check Shipping Address name />', () => {
  expect.assertions(4)
  const component = renderer.create(
    <AddressInput type="text" name="shipping_address_first_name" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(tree.props.name).toBe('shipping_address_first_name')
  expect(tree.props.type).toBe('text')
  expect(rendered.type).toBe('input')
})

test('<AddressInput with custom children />', () => {
  expect.assertions(4)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <AddressInput type="text" name="shipping_address_first_name">
      {CustomComponent}
    </AddressInput>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe(CustomComponent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
})
