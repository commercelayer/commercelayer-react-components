import React, { FunctionComponent, useContext } from 'react'
import { GeneralComponent } from '../@types/index'
import Parent from './utils/Parent'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'

export interface QuantitySelectorProps extends GeneralComponent {
  min?: number
  max?: number
  defaultValue?: number
  skuCode?: string
  children?: FunctionComponent
  currentSkuInventory?: {
    available: boolean
    quantity: number
  }
}

const QuantitySelector: FunctionComponent<QuantitySelectorProps> = props => {
  const { skuCode, children, min, max, ...p } = props
  const { item, setQuantity, items, quantity } = useContext(ItemContext)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item)
  const disabled = !sCode
  const handleChange = (e): void => {
    const qty = Number(e.target.value)
    if (sCode) {
      setQuantity({ ...quantity, [`${sCode}`]: qty })
    }
  }
  const inventory = _.isEmpty(item) ? 50 : item[sCode]?.inventory?.quantity
  const maxInv = max || inventory
  const parentProps = {
    min,
    max: maxInv,
    disabled,
    handleChange,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      type="number"
      max={maxInv}
      disabled={disabled}
      onChange={handleChange}
      {...p}
    />
  )
}

QuantitySelector.defaultProps = {
  min: 1,
  defaultValue: 1
}

export default QuantitySelector
