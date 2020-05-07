import React from 'react'
import { SubTotalAmount } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import BaseOrderPrice from '../src/components/utils/BaseOrderPrice'
import Parent from '../src/components/utils/Parent'

const propTypes = components.SubTotalAmount.propTypes

test('<SubTotalAmount/>', () => {
  expect.assertions(3)
  const component = renderer.create(<SubTotalAmount />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.format).toBe(propTypes.format)
})

test('<SubTotalAmount children rendered />', () => {
  expect.assertions(3)
  const component = renderer.create(<SubTotalAmount />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.nodeType).toBe('component')
  expect(rendered.type).toBe(BaseOrderPrice)
})

test('<SubTotalAmount with custom children />', () => {
  expect.assertions(5)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <SubTotalAmount format="cents">{CustomComponent}</SubTotalAmount>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const parentRendered = root.rendered.rendered
  const childRendered = parentRendered.rendered
  expect(tree).toMatchSnapshot()

  expect(rendered.props.children).toBe(CustomComponent)

  expect(parentRendered.nodeType).toBe('component')
  expect(parentRendered.type).toBe(Parent)

  expect(childRendered.props.price).not.toBeUndefined()
})
