import React from 'react'
import { LineItemQuantity } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'
import Parent from '../#components/utils/Parent'

const propTypes = components.LineItemQuantity.propTypes

test('<LineItemQuantity/>', () => {
  expect.assertions(5)
  const component = renderer.create(<LineItemQuantity />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.max).toBe(propTypes.max)
  expect(proptypes.disabled).toBe(propTypes.disabled)
  expect(proptypes.readonly).toBe(propTypes.readonly)
})

test('<LineItemQuantity check children format />', () => {
  expect.assertions(5)
  const component = renderer.create(<LineItemQuantity max={20} disabled />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(root.type).toBe(LineItemQuantity)
  expect(root.props.max).toBe(20)
  expect(root.props.disabled).toBe(true)
  expect(childRendered).toHaveLength(20)
})

test('<LineItemQuantity with custom children />', () => {
  expect.assertions(9)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemQuantity>{CustomComponent}</LineItemQuantity>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(root.props.max).toBe(50)
  expect(root.props.quantity).toBeUndefined()
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.props.max).toBe(50)
  expect(childRendered.rendered.nodeType).toBe('host')
  expect(childRendered.rendered.type).toBe('span')
})
