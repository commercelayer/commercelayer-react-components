/// <reference types="jest"/>
import React from 'react'
import { AddToCart } from '../src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<AddToCart/>', () => {
  // expect.assertions(6)
  const component = renderer.create(<AddToCart />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const proptypes = root.type['propTypes']
  console.log('root', root)
  expect(tree).toMatchSnapshot()
  expect(root.type['propTypes'].children).toBe(PropTypes.func)
  expect(proptypes.label).toBe(PropTypes.string)
  expect(rendered.props.children).toBe('add to cart')
  expect(proptypes.skuCode).toBe(PropTypes.string)
})
