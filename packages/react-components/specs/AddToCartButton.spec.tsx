import { AddToCartButton, ItemContainer } from '../packages/react-components/src'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'

test('<AddToCartButton/>', () => {
  expect.assertions(7)
  const component = renderer.create(<AddToCartButton />)
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  const proptypes = root.type['propTypes']
  expect(tree).toMatchSnapshot()

  expect(proptypes.children).toBe(PropTypes.func)
  expect(proptypes.label).toBe(PropTypes.string)
  expect(proptypes.skuCode).toBe(PropTypes.string)
  expect(proptypes.disabled).toBe(PropTypes.bool)
  expect(rendered.props.children).toBe('Add to cart')
  expect(rendered.props.disabled).toBe(true)
})

test('<AddToCartButton with props />', () => {
  expect.assertions(3)
  const component = renderer.create(
    <AddToCartButton label="Add to basket" skuCode="SKUCODE12345" />
  )
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  expect(tree).toMatchSnapshot()
  expect(rendered.props.children).toBe('Add to basket')
  expect(root.props.skuCode).toBe('SKUCODE12345')
})

test('<AddToCartButton with custom children />', () => {
  expect.assertions(8)
  const CustomComponent = (props) => <span>{props.label}</span>
  const component = renderer.create(
    <AddToCartButton
      label="Add to basket"
      disabled={false}
      skuCode="SKUCODE12345"
    >
      {CustomComponent}
    </AddToCartButton>
  )
  const tree = component.toJSON()
  const root: any = component.toTree()
  const rendered = root.rendered
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()

  expect(rendered.props.children).toBe(CustomComponent)
  expect(rendered.props.disabled).toBe(false)
  expect(rendered.props.label).toBe('Add to basket')
  expect(rendered.props.skuCode).toBe('SKUCODE12345')
  expect(rendered.props.handleClick).toBeTruthy()

  expect(childRendered.nodeType).toBe('component')
  expect(childRendered.type).toBe(CustomComponent)
})

test('<AddToCartButton with ItemContainer skuCode />', () => {
  expect.assertions(2)
  const component = renderer.create(
    <ItemContainer skuCode="SKUCODE12345">
      <AddToCartButton />
    </ItemContainer>
  )
  const tree = component.toJSON()
  const root: any = component.toTree()
  const childRendered = root.rendered.rendered
  expect(tree).toMatchSnapshot()
  expect(childRendered.props.disabled).toBeTruthy()
})
