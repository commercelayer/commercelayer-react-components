import React from 'react'
import PriceTemplate from '../#components/utils/PriceTemplate'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<PriceTemplate/>', () => {
  expect.assertions(3)
  const component = renderer.create(<PriceTemplate />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.formattedAmount).toBe(PropTypes.string)
  expect(proptypes.formattedCompare).toBe(PropTypes.string)
})

test('<PriceTemplate check children format />', () => {
  expect.assertions(3)
  const component = renderer.create(<PriceTemplate />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.type).toBe('span')
  expect(root.nodeType).toBe('component')
})
