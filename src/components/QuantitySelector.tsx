import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from 'react'
import Parent from './utils/Parent'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.QuantitySelector.propTypes
const defaultProps = components.QuantitySelector.defaultProps
const displayName = components.QuantitySelector.displayName

export type QuantitySelectorProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['input']

const QuantitySelector: FunctionComponent<QuantitySelectorProps> = (props) => {
  const { skuCode, children, min, max, ...p } = props
  const {
    item,
    setQuantity,
    items,
    quantity,
    prices,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  const [value, setValue] = useState(min)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item) || (itemSkuCode as string)
  const disabled = p.disabled || !prices[sCode] || !sCode
  const inventory = _.isEmpty(item) ? 50 : item[sCode]?.inventory?.quantity
  const maxInv = max || inventory
  useEffect(() => {
    setValue(min)
    if (sCode) {
      const qty = Number(min)
      setQuantity && setQuantity({ ...quantity, [`${sCode}`]: qty })
    }
    return (): void => {
      setValue(min)
    }
  }, [item])
  const handleChange = (e): void => {
    const qty = Number(e.target.value)
    const valid = Number(qty) >= Number(min) && Number(qty) <= Number(maxInv)
    setValue(qty)
    if (sCode && valid) {
      setQuantity && setQuantity({ ...quantity, [`${sCode}`]: Number(qty) })
    }
  }
  const handleBlur = (e): void => {
    const qty = e.target.value
    const valid = Number(qty) >= Number(min) && Number(qty) <= Number(maxInv)
    if (!valid) {
      const resetVal = Number(qty) < Number(min) ? min : maxInv
      setValue(resetVal)
      setQuantity &&
        setQuantity({ ...quantity, [`${sCode}`]: Number(resetVal) })
    }
  }
  const parentProps = {
    min,
    max: maxInv,
    disabled,
    handleChange,
    handleBlur,
    value,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      type="number"
      max={maxInv}
      min={min}
      value={value || ''}
      disabled={disabled}
      onChange={handleChange}
      onBlur={handleBlur}
      {...p}
    />
  )
}

QuantitySelector.propTypes = propTypes
QuantitySelector.defaultProps = defaultProps
QuantitySelector.displayName = displayName

export default QuantitySelector
