import React from 'react'
import { SkuOptionInput } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import BaseInput from '../src/components/utils/BaseInput'
import Parent from '../src/components/utils/Parent'

const propTypes = components.SkuOptionInput.propTypes

test('<SkuOptionInput/>', () => {
  expect.assertions(5)
  const component = renderer.create(
    <SkuOptionInput type="text" name="firstName" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.type).toBe(propTypes.type)
  expect(proptypes.name).toBe(propTypes.name)
  expect(proptypes.placeholder).toBe(propTypes.placeholder)
})

test('<SkuOptionInput check type required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<SkuOptionInput />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      'The prop `name` is marked as required in `SkuOptionInput`, but its value is `undefined`'
    )
  )
  expect(console.error.mock.calls[1][2]).toEqual(
    expect.stringContaining(
      'The prop `type` is marked as required in `SkuOptionInput`, but its value is `undefined`'
    )
  )
})

test('<SkuOptionInput check children type textarea />', () => {
  expect.assertions(4)
  const component = renderer.create(
    <SkuOptionInput type="textarea" name="reference" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('textarea')
  expect(root.props.type).toBe('textarea')
  expect(root.props.name).toBe('reference')
})

test('<SkuOptionInput check children type date />', () => {
  expect.assertions(4)
  const component = renderer.create(
    <SkuOptionInput type="date" name="expiresAt" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('input')
  expect(root.props.name).toBe('expiresAt')
  expect(root.props.type).toBe('date')
})

test('<SkuOptionInput with custom children />', () => {
  expect.assertions(4)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <SkuOptionInput>{CustomComponent}</SkuOptionInput>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe(CustomComponent)
  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
})
