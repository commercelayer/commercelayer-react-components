import React from 'react'
import PriceTemplate from '../src/components/PriceTemplate'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.PriceTemplate.propTypes

test('<PriceTemplate/>', () => {
  expect.assertions(3)
  const component = renderer.create(<PriceTemplate />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.formattedAmount).toBe(propTypes.formattedAmount)
  expect(proptypes.formattedCompare).toBe(propTypes.formattedCompare)
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
