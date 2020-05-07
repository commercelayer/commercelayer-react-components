import React from 'react'
import { LineItemRemoveLink } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import Parent from '../src/components/utils/Parent'

const propTypes = components.LineItemRemoveLink.propTypes

test('<LineItemRemoveLink/>', () => {
  expect.assertions(3)
  const component = renderer.create(<LineItemRemoveLink />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.label).toBe(propTypes.label)
})

test('<LineItemRemoveLink check children format />', () => {
  expect.assertions(3)
  const component = renderer.create(
    <LineItemRemoveLink label="remove product" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('a')
  expect(root.props.label).toBe('remove product')
})

test('<LineItemRemoveLink with custom children />', () => {
  expect.assertions(7)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemRemoveLink>{CustomComponent}</LineItemRemoveLink>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(rendered.props.handleRemove).toBeDefined()
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.rendered.nodeType).toBe('host')
  expect(childRendered.rendered.type).toBe('span')
})
