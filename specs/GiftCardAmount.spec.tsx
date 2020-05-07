import React from 'react'
import { GiftCardAmount } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import BaseOrderPrice from '../src/components/utils/BaseOrderPrice'
import Parent from '../src/components/utils/Parent'

const propTypes = components.GiftCardAmount.propTypes

test('<GiftCardAmount/>', () => {
  expect.assertions(3)
  const component = renderer.create(<GiftCardAmount />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.format).toBe(propTypes.format)
})

test('<GiftCardAmount check children format />', () => {
  expect.assertions(4)
  const component = renderer.create(<GiftCardAmount format="float" />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(BaseOrderPrice)
  expect(rendered.props.format).toBe('float')
  expect(childRendered.type).toBe('span')
})

test('<GiftCardAmount with custom children />', () => {
  expect.assertions(4)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <GiftCardAmount>{CustomComponent}</GiftCardAmount>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe(CustomComponent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(Parent)
})
