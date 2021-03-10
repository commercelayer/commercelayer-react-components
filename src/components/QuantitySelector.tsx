import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from 'react'
import Parent from './utils/Parent'
import { isEmpty, has } from 'lodash'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import ItemContext from '#context/ItemContext'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import SkuListsContext from '#context/SkuListsContext'

const propTypes = components.QuantitySelector.propTypes
const defaultProps = components.QuantitySelector.defaultProps
const displayName = components.QuantitySelector.displayName

type QuantitySelectorChildrenProps = FunctionChildren<
  Omit<QuantitySelectorProps, 'children'> & {
    handleChange: (event: React.MouseEvent<HTMLInputElement>) => void
    handleBlur: (event: React.MouseEvent<HTMLInputElement>) => void
  }
>

type QuantitySelectorProps = {
  children?: QuantitySelectorChildrenProps
  disabled?: boolean
  min?: number
  max?: number
  value?: string
  skuCode?: string
  skuListId?: string
} & JSX.IntrinsicElements['input']

const QuantitySelector: FunctionComponent<QuantitySelectorProps> = (props) => {
  const { skuCode, skuListId, children, min = 1, max, ...p } = props
  const {
    item,
    setQuantity,
    items,
    quantity,
    prices,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  const { skuLists, listIds } = useContext(SkuListsContext)
  const [value, setValue] = useState(min)
  const [disabled, setDisabled] = useState(!!p.disabled)
  const sCode =
    !isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item) || (itemSkuCode as string)

  const inventory = isEmpty(item) ? 50 : item[sCode]?.inventory?.quantity
  const maxInv = max || inventory
  useEffect(() => {
    setValue(min)
    if (!prices[sCode] || !sCode) {
      setDisabled(true)
    }
    skuListId && setDisabled(false)
    if (sCode) {
      const qty = Number(min)
      setQuantity && setQuantity({ ...quantity, [`${sCode}`]: qty })
      if (!isEmpty(prices) && has(prices, sCode)) setDisabled(false)
    }
    return (): void => {
      setValue(min)
    }
  }, [item, listIds, prices])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const qty = Number(e.target.value)
    const valid = Number(qty) >= Number(min) && Number(qty) <= Number(maxInv)
    setValue(qty)
    if (!isEmpty(skuLists) && skuListId && valid) {
      setQuantity && setQuantity({ ...quantity, [`${skuListId}`]: Number(qty) })
    } else if (sCode && valid) {
      setQuantity && setQuantity({ ...quantity, [`${sCode}`]: Number(qty) })
    }
  }
  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const qty = e.target.value
    const valid = Number(qty) >= Number(min) && Number(qty) <= Number(maxInv)
    if (!valid) {
      const resetVal = Number(qty) < Number(min) ? min : maxInv
      setValue(resetVal)
      if (!isEmpty(skuLists) && skuListId) {
        setQuantity &&
          setQuantity({ ...quantity, [`${skuListId}`]: Number(resetVal) })
      } else {
        setQuantity &&
          setQuantity({ ...quantity, [`${sCode}`]: Number(resetVal) })
      }
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
