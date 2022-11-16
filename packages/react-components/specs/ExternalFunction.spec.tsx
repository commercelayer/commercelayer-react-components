import React from 'react'
import { ExternalFunction, Price } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import components from '../#config/components'

const propTypes = components.ExternalFunction.propTypes

test('<ExternalFunction/>', () => {
  expect.assertions(3)
  const component = renderer.create(
    <ExternalFunction url="//localhost:3000/api/import-line-items">
      <div>children</div>
    </ExternalFunction>
  )
  const tree = component.toJSON()
  const root = component.toTree()
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()
  expect(proptypes.children).toBe(propTypes.children)
  expect(proptypes.url).toBe(propTypes.url)
})

test('<ExternalFunction check type required />', () => {
  expect.assertions(3)
  console.error = jest.fn()
  const component = renderer.create(<ExternalFunction />)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `The prop 'children' is marked as required in 'ExternalFunction', but its value is 'undefined'`
    )
  )
  expect(console.error.mock.calls[1][2]).toEqual(
    expect.stringContaining(
      'The prop `url` is marked as required in `ExternalFunction`, but its value is `undefined`'
    )
  )
})

test('<ExternalFunction permitted children error />', () => {
  expect.assertions(2)
  console.error = jest.fn()
  const component = renderer.create(
    <ExternalFunction url="//localhost:3000/api/import-line-items">
      <Price />
    </ExternalFunction>
  )
  const tree = component.toJSON()

  expect(tree).toMatchSnapshot()

  expect(console.error.mock.calls[0][2]).toEqual(
    expect.stringContaining(
      `Invalid prop 'children' supplied to ExternalFunction. Only components AddToCartButton, ReactNode are allowed`
    )
  )
})
