import React from 'react'
import { GiftCardCurrencySelector } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'
import currencyOptions from '../#config/currency.json'

const propTypes = components.GiftCardCurrencySelector.propTypes

test('<GiftCardCurrencySelector/>', () => {
  expect.assertions(5)
  const component = renderer.create(<GiftCardCurrencySelector />)
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.placeholder).toBe(propTypes.placeholder)
  expect(proptypes.value).toBe(propTypes.value)
  expect(proptypes.required).toBe(propTypes.required)
})

test('<GiftCardCurrencySelector check children />', () => {
  const component = renderer.create(<GiftCardCurrencySelector />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const options = [...currencyOptions]
  const childrenRendered = rendered.rendered
  options.map(({ value, label }) => {
    const option = [
      {
        instance: null,
        nodeType: 'host',
        props: { value: value, children: label },
        rendered: [label],
        type: 'option',
      },
    ]
    expect(childrenRendered).toEqual(expect.arrayContaining(option))
  })
  expect(tree).toMatchSnapshot()
  expect(rendered.props.name).toBe('currencyCode')
  expect(rendered.props.required).toBeTruthy()
  expect(rendered.type).toStrictEqual('select')
})
