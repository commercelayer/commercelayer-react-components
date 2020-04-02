import React from 'react'
import { GiftCardInput } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import BaseInput from '../src/components/utils/BaseInput'

const propTypes = components.GiftCardInput.props

test('<GiftCardInput/>', () => {
  expect.assertions(5)
  const component = renderer.create(
    <GiftCardInput type="text" name="firstName" />
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

test('<GiftCardInput check type required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<GiftCardInput />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `type` is marked as required in `GiftCardInput`, but its value is `undefined`'
    )
  )
  expect(console.error.mock.calls[1][0]).toEqual(
    expect.stringContaining(
      'Warning: Failed prop type: The prop `name` is marked as required in `GiftCardInput`, but its value is `undefined`'
    )
  )
})

test('<GiftCardInput check children type textarea />', () => {
  expect.assertions(4)
  const component = renderer.create(
    <GiftCardInput type="textarea" name="reference" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(BaseInput)
  expect(childRendered.type).toBe('textarea')
  expect(childRendered.props.name).toBe('reference')
})

test('<GiftCardInput check children type date />', () => {
  expect.assertions(5)
  const component = renderer.create(
    <GiftCardInput type="date" name="expiresAt" />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const childRendered = rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe(BaseInput)
  expect(childRendered.type).toBe('input')
  expect(childRendered.props.name).toBe('expiresAt')
  expect(childRendered.props.type).toBe('date')
})
