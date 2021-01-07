import React from 'react'
import { BillingAddress, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.BillingAddress.propTypes

test('<BillingAddress/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <BillingAddress>
      <div>test</div>
    </BillingAddress>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<BillingAddress proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<BillingAddress />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'BillingAddress', but its value is 'undefined'.`
    )
  )
})

test('<BillingAddress check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <BillingAddress>
      <Price />
    </BillingAddress>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to BillingAddress. Only components AddressInput, ReactNode are allowed.`
    )
  )
})
