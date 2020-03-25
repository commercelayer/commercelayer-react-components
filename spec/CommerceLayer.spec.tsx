import React from 'react'
import { CommerceLayer, OrderContainer } from '../src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<CommerceLayer/>', () => {
  expect.assertions(6)
  const CustomComponent = props => <span>{props.label}</span>
  const component = renderer.create(
    <CommerceLayer accessToken="myAccessToken" endpoint="myEndpoint">
      {/* <CustomComponent /> */}
    </CommerceLayer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()

  console.log('root', root)
  // console.log('rendered', rendered)

  expect(root.props.accessToken).toBe('myAccessToken')
  expect(root.props.endpoint).toBe('myEndpoint')

  console.log('PropTypes.string.isRequired', PropTypes.string.isRequired)

  expect(proptypes.children).toBe(PropTypes.node.isRequired)
  expect(proptypes.accessToken).toBe(PropTypes.string.isRequired)
  expect(proptypes.endpoint).toBe(PropTypes.string.isRequired)
})
