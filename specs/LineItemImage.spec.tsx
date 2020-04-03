import React from 'react'
import { LineItemImage } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import Parent from '../src/components/utils/Parent'

const propTypes = components.LineItemImage.propTypes

test('<LineItemImage/>', () => {
  expect.assertions(4)
  const component = renderer.create(<LineItemImage />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.width).toBe(propTypes.width)
  expect(proptypes.src).toBe(propTypes.src)
})

test('<LineItemImage with custom children />', () => {
  expect.assertions(8)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemImage width={80} src="test.jpg">
      {CustomComponent}
    </LineItemImage>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(rendered.props.children).toBe(CustomComponent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.props.width).toBe(80)
  expect(childRendered.props.src).toBe('test.jpg')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.rendered.type).toBe('span')
})
