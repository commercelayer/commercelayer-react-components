import React from 'react'
import { GiftCardCurrencySelector } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'
import currencyOptions from '../src/config/currency.json'

const propTypes = components.GiftCardCurrencySelector.props

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
  expect.assertions(6)
  const component = renderer.create(<GiftCardCurrencySelector />)
  const tree = component.toJSON()
  const root = component.toTree()
  const rendered = root.rendered
  const options = [...currencyOptions]
  const childrenRendered = rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.options).toStrictEqual(options)
  expect(rendered.props.name).toStrictEqual('currencyCode')
  expect(rendered.props.required).toBeTruthy()
  expect(rendered.props.placeholder).toStrictEqual({
    label: 'select an option',
    value: ''
  })
  expect(childrenRendered.type).toStrictEqual('select')
})
