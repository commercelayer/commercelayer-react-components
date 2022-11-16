import React from 'react'
import { LineItemsCount } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'
import Parent from '../#components/utils/Parent'

const propTypes = components.LineItemsCount.propTypes

test('<LineItemsCount/>', () => {
  expect.assertions(2)
  const component = renderer.create(<LineItemsCount />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<LineItemsCount check children format />', () => {
  expect.assertions(2)
  const component = renderer.create(<LineItemsCount />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('span')
})

test('<LineItemsCount with custom children />', () => {
  expect.assertions(6)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <LineItemsCount>{CustomComponent}</LineItemsCount>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.rendered.nodeType).toBe('host')
  expect(childRendered.rendered.type).toBe('span')
})
