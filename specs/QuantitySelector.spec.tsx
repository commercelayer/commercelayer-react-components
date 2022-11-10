import React from 'react'
import { QuantitySelector } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'
import Parent from '../#components/utils/Parent'

const propTypes = components.QuantitySelector.propTypes

test('<QuantitySelector/>', () => {
  expect.assertions(7)
  const component = renderer.create(
    <QuantitySelector type="text" name="firstName" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.min).toBe(propTypes.min)
  expect(proptypes.max).toBe(propTypes.max)
  expect(proptypes.value).toBe(propTypes.value)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
  expect(proptypes.disabled).toBe(propTypes.disabled)
})

test('<QuantitySelector check children type textarea />', () => {
  expect.assertions(5)
  const component = renderer.create(<QuantitySelector min={1} max={20} />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('input')
  expect(rendered.nodeType).toBe('host')
  expect(rendered.props.max).toBe(20)
  expect(rendered.props.min).toBe(1)
})

test('<QuantitySelector with custom children />', () => {
  expect.assertions(7)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <QuantitySelector>{CustomComponent}</QuantitySelector>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(Parent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
  expect(childRendered.props.handleChange).toBeTruthy()
  expect(childRendered.props.handleBlur).toBeTruthy()
  expect(childRendered.rendered.type).toBe('span')
})
