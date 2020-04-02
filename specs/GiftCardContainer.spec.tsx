import React from 'react'
import { GiftCardContainer, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.GiftCardContainer.props

test('<GiftCardContainer/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <GiftCardContainer>
      <div>test</div>
    </GiftCardContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<GiftCardContainer proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<GiftCardContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'GiftCardContainer', but its value is 'undefined'`
    )
  )
})

test('<GiftCardContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <GiftCardContainer>
      <Price />
    </GiftCardContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to GiftCardContainer. Only components GiftCard, ReactNode are allowed.`
    )
  )
})
