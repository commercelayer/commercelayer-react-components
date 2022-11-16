import React from 'react'
import { SaveAddressesButton } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<SaveAddressesButton/>', () => {
  expect.assertions(6)
  const component = renderer.create(<SaveAddressesButton />)
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(PropTypes.func)
  expect(proptypes.label).toBe(PropTypes.string)
  expect(proptypes.disabled).toBe(PropTypes.bool)
  expect(rendered.props.children).toBe('Continue to delivery')
  expect(rendered.props.disabled).toBe(true)
})

test('<SaveAddressesButton with props />', () => {
  expect.assertions(2)
  const component = renderer.create(<SaveAddressesButton label="Continue" />)
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe('Continue')
})

test('<SaveAddressesButton with custom children />', () => {
  expect.assertions(6)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <SaveAddressesButton label="Continue">
      {CustomComponent}
    </SaveAddressesButton>
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
