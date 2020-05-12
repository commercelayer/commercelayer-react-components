import React from 'react'
import { LineItemOption } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import Parent from '../src/components/utils/Parent'

const propTypes = components.LineItemOption.propTypes

test('<LineItemOption/>', () => {
  expect.assertions(6)
  const component = renderer.create(<LineItemOption name="test" />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.name).toBe(propTypes.name)
  expect(proptypes.keyClassName).toBe(propTypes.keyClassName)
  expect(proptypes.keyId).toBe(propTypes.keyId)
  expect(proptypes.keyStyle).toBe(propTypes.keyStyle)
})

test('<LineItemOption proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<LineItemOption />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `name` is marked as required in `LineItemOption`, but its value is `undefined`.'
    )
  )
})

test('<LineItemOption with custom children />', () => {
  // expect.assertions(7)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemOption name="test">{CustomComponent}</LineItemOption>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(rendered.props.children).toBe(CustomComponent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.props.name).toBe('test')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.rendered.type).toBe('span')
})
