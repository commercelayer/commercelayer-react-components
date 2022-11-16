import React from 'react'
import VariantTemplate, {
  propTypes,
} from '../#components/utils/VariantTemplate'
import renderer from 'react-test-renderer'

test('<VariantTemplate/>', () => {
  expect.assertions(9)
  const component = renderer.create(
    <VariantTemplate
      options={[
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
  expect(proptypes.options).toBe(propTypes.options)
  expect(proptypes.name).toBe(propTypes.name)
  expect(proptypes.type).toBe(propTypes.type)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
  expect(proptypes.variants).toBe(propTypes.variants)
  expect(proptypes.onChange).toBe(propTypes.onChange)
})
