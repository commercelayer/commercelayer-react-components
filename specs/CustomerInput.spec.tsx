import React from 'react'
import { CustomerInput } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.CustomerInput.propTypes

test('<CustomerInput/>', () => {
  expect.assertions(5)
  const component = renderer.create(<CustomerInput />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.type).toBe(propTypes.type)
  expect(proptypes.name).toBe(propTypes.name)
  expect(proptypes.placeholder).toBe(propTypes.placeholder)
})

test('<CustomerInput check default props />', () => {
  expect.assertions(4)
  const component = renderer.create(<CustomerInput />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(tree.props.name).toBe('customer_email')
  expect(tree.props.type).toBe('email')
  expect(rendered.type).toBe('input')
})

test('<CustomerInput with custom children />', () => {
  expect.assertions(4)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <CustomerInput>{CustomComponent}</CustomerInput>
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
