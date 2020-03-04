import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect
} from 'react'
import { BaseComponent } from '../@types/index'
import Parent from './utils/Parent'
import _ from 'lodash'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import ItemContext from '../context/ItemContext'
import PropTypes from 'prop-types'

export interface QuantitySelectorProps extends BaseComponent {
  min?: string
  max?: string
  value?: string
  skuCode?: string
  children?: FunctionComponent
}

const QuantitySelector: FunctionComponent<QuantitySelectorProps> = props => {
  const { skuCode, children, min, max, ...p } = props
  const { item, setQuantity, items, quantity } = useContext(ItemContext)
  const [value, setValue] = useState(min)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item)
  const disabled = !sCode
  const inventory = _.isEmpty(item) ? 50 : item[sCode]?.inventory?.quantity
  const maxInv = max || inventory
  useEffect(() => {
    setValue(min)
    return (): void => {
      setValue(min)
    }
  }, [item])
  const handleChange = (e): void => {
    const qty = e.target.value
    const valid = Number(qty) >= Number(min) && Number(qty) <= Number(maxInv)
    setValue(qty)
    if (sCode && valid) {
      setQuantity({ ...quantity, [`${sCode}`]: qty })
    }
  }
  const handleBlur = (e): void => {
    const qty = e.target.value
    const valid = Number(qty) >= Number(min) && Number(qty) <= Number(maxInv)
    if (!valid) {
      const resetVal = Number(qty) < Number(min) ? min : maxInv
      setValue(resetVal as string)
    }
  }
  const parentProps = {
    min,
    max: maxInv,
    disabled,
    handleChange,
    handleBlur,
    value,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      type="number"
      max={maxInv}
      min={min}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      onBlur={handleBlur}
      {...p}
    />
  )
}

QuantitySelector.defaultProps = {
  min: '1'
}

QuantitySelector.propTypes = {
  children: PropTypes.func,
  min: PropTypes.string,
  max: PropTypes.string,
  value: PropTypes.string,
  skuCode: PropTypes.string
}

export default QuantitySelector
