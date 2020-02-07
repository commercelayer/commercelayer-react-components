import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import VariantContext from '../context/VariantContext'
import { GeneralComponent } from '../@types/index'
import PriceContext from '../context/PriceContext'
import _ from 'lodash'

export interface AddToCartProps extends GeneralComponent {
  label?: string
  disabled?: boolean
  skuCode?: string
  children?: FunctionComponent
}

const AddToCart: FunctionComponent<AddToCartProps> = props => {
  const { label, children, skuCode, ...p } = props
  const { addToCart, singleQuantity } = useContext(OrderContext)
  const { skuCode: currentSkuCode, currentSkuId, currentQuantity } = useContext(
    VariantContext
  )
  const { prices } = useContext(PriceContext)
  const sCode = !_.isEmpty(prices)
    ? prices[skuCode]?.skuCode
    : skuCode || currentSkuCode
  const handleClick = (): void => {
    const qty = skuCode ? singleQuantity[skuCode] : currentQuantity
    addToCart(sCode, currentSkuId, qty)
  }
  const disabled = !sCode
  const parentProps = {
    handleClick,
    disabled,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button disabled={disabled} onClick={handleClick} {...p}>
      {label ? label : 'add to cart'}
    </button>
  )
}

export default AddToCart
