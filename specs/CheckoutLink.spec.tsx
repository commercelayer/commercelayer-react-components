import React from 'react'
import { CheckoutLink } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.CheckoutLink.propTypes

test('<CheckoutLink/>', () => {
  expect.assertions(3)
  const component = renderer.create(<CheckoutLink />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.label).toBe(propTypes.label)
})

test('<CheckoutLink with props />', () => {
  expect.assertions(3)
  const component = renderer.create(<CheckoutLink />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.nodeType).toBe('host')
  expect(rendered.type).toBe('a')
})

test('<CheckoutLink with custom children />', () => {
  expect.assertions(5)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <CheckoutLink label="My checkout">{CustomComponent}</CheckoutLink>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()

  expect(rendered.props.children).toBe(CustomComponent)

  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)

  expect(childRendered.props.label).toBe('My checkout')
})
