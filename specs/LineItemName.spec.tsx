import React from 'react'
import { LineItemName } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import Parent from '../src/components/utils/Parent'

const propTypes = components.LineItemName.propTypes

test('<LineItemName/>', () => {
  expect.assertions(2)
  const component = renderer.create(<LineItemName />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<LineItemName with custom children />', () => {
  expect.assertions(7)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemName className="unit-test">{CustomComponent}</LineItemName>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(rendered.props.children).toBe(CustomComponent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.props.className).toBe('unit-test')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.rendered.type).toBe('span')
})
