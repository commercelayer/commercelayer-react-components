import React from 'react'
import { CustomerContainer, CheckoutLink } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.CustomerContainer.propTypes

test('<CustomerContainer/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <CustomerContainer>
      <div>test</div>
    </CustomerContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<CustomerContainer check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <CustomerContainer>
      <CheckoutLink />
    </CustomerContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to CustomerContainer. Only components CustomerInput, SaveCustomerButton, AddressesContainer, ReactNode are allowed.`
    )
  )
})

test('<CustomerContainer children required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<CustomerContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'CustomerContainer', but its value is 'undefined'.`
    )
  )
})
