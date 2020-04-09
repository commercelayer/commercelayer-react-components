import React from 'react'
import { VariantSelector } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import currencyOptions from '../src/config/currency.json'
import Parent from '../src/components/utils/Parent'

const propTypes = components.VariantSelector.propTypes

test('<VariantSelector/>', () => {
  expect.assertions(8)
  const component = renderer.create(
    <VariantSelector
      skuCodes={[
        {
          label: '6 months',
          code: 'BABYONBU000000E63E746MXX',
        },
      ]}
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
  expect(proptypes.loader).toBe(propTypes.loader)
  expect(proptypes.skuCode).toBe(propTypes.skuCode)
})

test('<VariantSelector check children />', () => {
  expect.assertions(3)
  const component = renderer.create(
    <VariantSelector
      skuCodes={[
        {
          label: '6 months',
          code: 'BABYONBU000000E63E746MXX',
        },
      ]}
    />
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(root.props.placeholder).toStrictEqual('select variant')
  expect(root.props.type).toStrictEqual('select')
})

test('<VariantSelector with custom children />', () => {
  expect.assertions(5)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <VariantSelector
      skuCodes={[
        {
          label: '6 months',
          code: 'BABYONBU000000E63E746MXX',
        },
      ]}
    >
      {CustomComponent}
    </VariantSelector>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const parentRendered = root.rendered.rendered
  const childRendered = parentRendered.rendered
  expect(tree).toMatchSnapshot()

  expect(rendered.props.children).toBe(CustomComponent)

  expect(parentRendered.nodeType).toBe('component')
  expect(parentRendered.type).toBe(CustomComponent)

  expect(childRendered.props.handleSelect).not.toBeDefined()
})
