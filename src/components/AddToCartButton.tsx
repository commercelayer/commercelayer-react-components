import React, {
  FunctionComponent,
  useContext,
  ReactNode,
  PropsWithoutRef,
} from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import components from '../config/components'

const propTypes = components.AddToCartButton.propTypes
const defaultProps = components.AddToCartButton.defaultProps
const displayName = components.AddToCartButton.displayName

type ChildrenFunctionProps = {
  handleClick: () => void
  label?: string
  skuCode?: string
  disabled?: boolean
} & PropsWithoutRef<JSX.IntrinsicElements['button']>

type AddToCartButtonProps = Omit<ChildrenFunctionProps, 'handleClick'> & {
  children?: (props: ChildrenFunctionProps) => ReactNode
} & PropsWithoutRef<JSX.IntrinsicElements['button']>

const AddToCartButton: FunctionComponent<AddToCartButtonProps> = (props) => {
  const { label = 'Add to cart', children, skuCode, disabled, ...p } = props
  const { addToCart } = useContext(OrderContext)
  const {
    item,
    items,
    quantity,
    option,
    prices,
    lineItems,
    lineItem,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item) || (itemSkuCode as string)
  const handleClick = (): void => {
    const qty = quantity[sCode]
    const opt = option[sCode]
    const customLineItem = !_.isEmpty(lineItem) ? lineItem : lineItems[sCode]
    if (addToCart)
      addToCart({
        skuCode: sCode,
        skuId: item[sCode]?.id,
        quantity: qty,
        option: opt,
        lineItem: customLineItem,
      })
  }
  const autoDisabled = disabled || !prices[sCode] || !sCode
  const parentProps = {
    handleClick,
    disabled: disabled || autoDisabled,
    label,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button disabled={autoDisabled} onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

AddToCartButton.propTypes = propTypes
AddToCartButton.defaultProps = defaultProps
AddToCartButton.displayName = displayName

export default AddToCartButton
