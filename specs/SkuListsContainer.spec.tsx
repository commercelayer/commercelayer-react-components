import React from 'react'
import { SkuListsContainer, CheckoutLink } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.SkuListsContainer.propTypes

test('<SkuListsContainer/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <SkuListsContainer>
      <div>test</div>
    </SkuListsContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<SkuListsContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <SkuListsContainer>
      <CheckoutLink />
    </SkuListsContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to SkuListsContainer. Only components SkuList, ReactNode are allowed.`
    )
  )
})
