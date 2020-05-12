import React from 'react'
import { AvailabilityContainer, Price } from '../src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'
import childrenTypes from '../src/utils/childrenTypes'

test('<AvailabilityContainer/>', () => {
  expect.assertions(4)
  const component = renderer.create(
    <AvailabilityContainer>
      <div>Commerce Layer</div>
    </AvailabilityContainer>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  const displayName = root.type['displayName']
  expect(tree).toMatchSnapshot()

  expect(proptypes.children).toBe(childrenTypes.isRequired)
  expect(proptypes.skuCode).toBe(PropTypes.string)
  expect(displayName).toBe('AvailabilityContainer')
})

test('<AvailabilityContainer children error />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <AvailabilityContainer>
      <Price />
    </AvailabilityContainer>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()

  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: Invalid prop 'children' supplied to AvailabilityContainer. Only components AvailabilityTemplate, ReactNode are allowed`
    )
  )
})

test('<AvailabilityContainer children required />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(<AvailabilityContainer />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()

  expect(console.error.mock.calls[0][0]).toEqual(
    expect.stringContaining(
      `Warning: Failed prop type: The prop 'children' is marked as required in 'AvailabilityContainer', but its value is 'undefined'.`
    )
  )
})
