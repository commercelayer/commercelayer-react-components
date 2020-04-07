import React from 'react'
import { Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import BaseInput from '../src/components/utils/BaseInput'
import Parent from '../src/components/utils/Parent'

const propTypes = components.Price.propTypes

test('<Price/>', () => {
  expect.assertions(5)
  const component = renderer.create(<Price />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.compareClassName).toBe(propTypes.compareClassName)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
  expect(proptypes.showCompare).toBe(propTypes.showCompare)
})

test('<Price with custom children />', () => {
  expect.assertions(7)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(<Price>{CustomComponent}</Price>)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.nodeType).toBe('component')
  expect(rendered.type).toBe(Parent)
  expect(rendered.props.loading).toBeTruthy()
  expect(rendered.props.loader).toBeUndefined()
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
})
