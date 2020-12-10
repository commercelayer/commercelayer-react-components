import React from 'react'
import { LineItemQuantity } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import Parent from '../src/components/utils/Parent'

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
  expect(rendered.type).toBe('select')
  expect(rendered.props.max).toBe(20)
  expect(rendered.props.disabled).toBe(true)
  expect(childRendered).toHaveLength(20)
})

test('<LineItemQuantity with custom children />', () => {
  expect.assertions(10)
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
  expect(rendered.props.max).toBe(50)
  expect(rendered.props.handleChange).toBeDefined()
  expect(rendered.props.quantity).toBeUndefined()
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.props.max).toBe(50)
  expect(childRendered.rendered.nodeType).toBe('host')
  expect(childRendered.rendered.type).toBe('span')
})
