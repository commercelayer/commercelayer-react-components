import React from 'react'
import { BillingAddressForm, Price } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.BillingAddressForm.propTypes

test('<BillingAddressForm/>', () => {
  expect.assertions(2)
  const component = renderer.create(
    <BillingAddressForm>
      <div>test</div>
    </BillingAddressForm>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
})

test('<BillingAddressForm proptypes required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<BillingAddressForm />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'BillingAddressForm', but its value is 'undefined'.`
    )
  )
})

test('<BillingAddressForm check children />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <BillingAddressForm>
      <Price />
    </BillingAddressForm>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to BillingAddressForm. Only components AddressInput, ReactNode are allowed.`
    )
  )
})
