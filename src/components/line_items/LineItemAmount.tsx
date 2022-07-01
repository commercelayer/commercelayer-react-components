import { useState, useEffect, useContext } from 'react'
import getAmount from '#utils/getAmount'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import { BaseAmountComponent, BasePriceType } from '#typings/index'

const propTypes = components.LineItemAmount.propTypes
const defaultProps = components.LineItemAmount.defaultProps as Props
const displayName = components.LineItemAmount.displayName

type Props = BaseAmountComponent & {
  type?: BasePriceType
}

export function LineItemAmount(props: Props) {
  const { format = 'formatted', type = 'total', ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const [price, setPrice] = useState('')
  useEffect(() => {
    if (lineItem) {
      const p = getAmount({
        base: 'amount',
        type,
        format,
        obj: lineItem,
      })
      setPrice(p)
    }
    return (): void => {
      setPrice('')
    }
  }, [lineItem])
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

LineItemAmount.propTypes = propTypes
LineItemAmount.defaultProps = defaultProps
LineItemAmount.displayName = displayName

export default LineItemAmount
