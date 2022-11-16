import React from 'react'
import { GiftCard, Price } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.GiftCard.propTypes

test('<GiftCard/>', () => {
  expect.assertions(4)
  const component = renderer.create(
    <GiftCard>
      <div>test</div>
    </GiftCard>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.metadata).toBe(propTypes.metadata)
  expect(proptypes.onSubmit).toBe(propTypes.onSubmit)
})

test('<GiftCard proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<GiftCard />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'GiftCard', but its value is 'undefined'.`
    )
  )
})

test('<GiftCard check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <GiftCard>
      <Price />
    </GiftCard>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to GiftCard. Only components GiftCardCurrencySelector, GiftCardInput, Errors, MetadataInput, SubmitButton, ReactNode are allowed.`
    )
  )
})
