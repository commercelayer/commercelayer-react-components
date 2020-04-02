import React from 'react'
import { AvailabilityTemplate } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.AvailabilityTemplate.propTypes

test('<AvailabilityTemplate/>', () => {
  expect.assertions(4)
  const component = renderer.create(<AvailabilityTemplate />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.timeFormat).toBe(propTypes.timeFormat)
  expect(proptypes.showShippingMethodName).toBe(
    propTypes.showShippingMethodName
  )
})

test('<AvailabilityTemplate with props />', () => {
  expect.assertions(3)
  const component = renderer.create(<AvailabilityTemplate />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.nodeType).toBe('host')
  expect(rendered.type).toBe('p')
})

test('<AvailabilityTemplate with custom children />', () => {
  expect.assertions(6)
  const CustomComponent = props => <span>{props.label}</span>
  const component = renderer.create(
    <AvailabilityTemplate timeFormat="hours">
      {CustomComponent}
    </AvailabilityTemplate>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()

  expect(rendered.props.children).toBe(CustomComponent)

  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)

  expect(childRendered.props.timeFormat).toBe('hours')
  expect(childRendered.props.showShippingMethodName).toBe(false)
})
