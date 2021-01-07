import React from 'react'
import { ShippingAddress, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.ShippingAddress.propTypes

test('<ShippingAddress/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <ShippingAddress>
      <div>test</div>
    </ShippingAddress>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<ShippingAddress proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<ShippingAddress />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'ShippingAddress', but its value is 'undefined'.`
    )
  )
})

test('<ShippingAddress check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <ShippingAddress>
      <Price />
    </ShippingAddress>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to ShippingAddress. Only components AddressInput, ReactNode are allowed.`
    )
  )
})
