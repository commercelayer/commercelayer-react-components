import React from 'react'
import { CommerceLayer, Price } from '../src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'
import childrenTypes from '../src/utils/childrenTypes'

test('<CommerceLayer/>', () => {
  expect.assertions(6)
  console.error = jest.fn()
  const component = renderer.create(
    <CommerceLayer accessToken="myAccessToken" endpoint="myEndpoint">
      <div>Commerce Layer</div>
    </CommerceLayer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(root.props.accessToken).toBe('myAccessToken')
  expect(root.props.endpoint).toBe('myEndpoint')

  expect(proptypes.children).toBe(childrenTypes.isRequired)
  expect(proptypes.accessToken).toBe(PropTypes.string.isRequired)
  expect(proptypes.endpoint).toBe(PropTypes.string.isRequired)
})

test('<CommerceLayer children error />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const CustomComponent = props => <span>{props.label}</span>
  const component = renderer.create(
    <CommerceLayer accessToken="myAccessToken" endpoint="myEndpoint">
      <CustomComponent />
      <Price />
    </CommerceLayer>
  )
  const tree = component.toJSON()

  expect(tree).toMatchSnapshot()

  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to CommerceLayer. Only components OrderContainer, PriceContainer, GiftCardContainer, ReactNode are allowed`
    )
  )
})

test('<CommerceLayer children required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <CommerceLayer accessToken="myAccessToken" endpoint="myEndpoint" />
  )
  const tree = component.toJSON()

  expect(tree).toMatchSnapshot()

  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'CommerceLayer', but its value is 'undefined'`
    )
  )
})
