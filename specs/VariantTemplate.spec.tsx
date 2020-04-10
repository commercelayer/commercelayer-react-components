import React from 'react'
import VariantTemplate from '../src/components/VariantTemplate'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.VariantTemplate.propTypes

test('<VariantTemplate/>', () => {
  expect.assertions(9)
  const component = renderer.create(
    <VariantTemplate
      skuCodes={[
        {
          label: '6 months',
          code: 'BABYONBU000000E63E746MXX',
        },
      ]}
      variants={{}}
    />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.placeholder).toBe(propTypes.placeholder)
  expect(proptypes.skuCodes).toBe(propTypes.skuCodes)
  expect(proptypes.name).toBe(propTypes.name)
  expect(proptypes.type).toBe(propTypes.type)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
  expect(proptypes.variants).toBe(propTypes.variants)
  expect(proptypes.onChange).toBe(propTypes.onChange)
})
