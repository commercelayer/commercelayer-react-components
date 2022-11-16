import React from 'react'
import { SaveCustomerButton } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<SaveCustomerButton/>', () => {
  expect.assertions(3)
  const component = renderer.create(<SaveCustomerButton />)
  const tree = component.toJSON()
  const root: any = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(PropTypes.func)
  expect(proptypes.label).toBe(PropTypes.string)
})

test('<SaveCustomerButton with props />', () => {
  expect.assertions(2)
  const component = renderer.create(<SaveCustomerButton label="Continue" />)
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe('Continue')
})

test('<SaveCustomerButton with custom children />', () => {
  expect.assertions(6)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <SaveCustomerButton label="Continue">{CustomComponent}</SaveCustomerButton>
  )
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe(CustomComponent)
  expect(rendered.props.label).toBe('Continue')
  expect(rendered.props.handleClick).toBeTruthy()
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
})
