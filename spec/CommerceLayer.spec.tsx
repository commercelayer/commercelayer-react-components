import React from 'react'
import { CommerceLayer } from '../src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<CommerceLayer/>', () => {
  expect.assertions(6)
  const component = renderer.create(
    <CommerceLayer accessToken="myAccessToken" endpoint="myEndpoint">
      Commerce Layer
    </CommerceLayer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(root.props.accessToken).toBe('myAccessToken')
  expect(root.props.endpoint).toBe('myEndpoint')
  expect(proptypes.children).toBe(PropTypes.node.isRequired)
  expect(proptypes.accessToken).toBe(PropTypes.string.isRequired)
  expect(proptypes.endpoint).toBe(PropTypes.string.isRequired)
})
