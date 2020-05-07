import React from 'react'
import { LineItemAmount } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import Parent from '../src/components/utils/Parent'

const propTypes = components.LineItemAmount.propTypes

test('<LineItemAmount/>', () => {
  expect.assertions(4)
  const component = renderer.create(<LineItemAmount />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.format).toBe(propTypes.format)
  expect(proptypes.type).toBe(propTypes.type)
})

test('<LineItemAmount check children format />', () => {
  expect.assertions(4)
  const component = renderer.create(
    <LineItemAmount format="float" type="unit" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('span')
  expect(root.props.format).toBe('float')
  expect(root.props.type).toBe('unit')
})

test('<LineItemAmount with custom children />', () => {
  expect.assertions(8)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemAmount>{CustomComponent}</LineItemAmount>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(rendered.props.price).toBe('')
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.props.price).toBe('')
  expect(childRendered.rendered.nodeType).toBe('host')
  expect(childRendered.rendered.type).toBe('span')
})
