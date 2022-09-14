import React from 'react'
import { ShippingAddressForm, Price } from '../src'
import renderer from 'react-test-renderer'
import components from '../src/config/components'

const propTypes = components.ShippingAddressForm.propTypes

test('<ShippingAddressForm/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <ShippingAddressForm>
      <div>test</div>
    </ShippingAddressForm>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<ShippingAddressForm proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<ShippingAddressForm />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'ShippingAddressForm', but its value is 'undefined'.`
    )
  )
})

test('<ShippingAddressForm check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <ShippingAddressForm>
      <Price />
    </ShippingAddressForm>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to ShippingAddressForm. Only components AddressInput, ReactNode are allowed.`
    )
  )
})
