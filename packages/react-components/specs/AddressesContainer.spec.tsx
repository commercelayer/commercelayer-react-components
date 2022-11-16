import React from 'react'
import { AddressesContainer, CheckoutLink } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.AddressesContainer.propTypes

test('<AddressesContainer/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <AddressesContainer>
      <div>test</div>
    </AddressesContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.shipToDifferentAddress).toBe(
    propTypes.shipToDifferentAddress
  )
})

test('<AddressesContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <AddressesContainer>
      <CheckoutLink />
    </AddressesContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to AddressesContainer. Only components BillingAddressForm, BillingAddressContainer, ShippingAddressForm, ShippingAddressContainer, SaveAddressesButton, ReactNode are allowed.`
    )
  )
})

test('<AddressesContainer children required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<AddressesContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'AddressesContainer', but its value is 'undefined'.`
    )
  )
})
