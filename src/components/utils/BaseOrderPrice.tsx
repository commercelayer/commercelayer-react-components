import OrderContext from '../../context/OrderContext'
import getAmount from '../../utils/getAmount'
import Parent from './Parent'
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import PropTypes, { InferProps } from 'prop-types'

export const BOPProps = {
  base: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  children: PropTypes.func,
  format: PropTypes.oneOf(['formatted', 'cents', 'float'])
}

export const BOCProps = {
  children: BOPProps['children'],
  format: BOPProps['format']
}

export type BaseOrderComponentProps = InferProps<typeof BOCProps>

export type BaseOrderPriceProps = InferProps<typeof BOPProps> &
  JSX.IntrinsicElements['span']

const BaseOrderPrice: FunctionComponent<BaseOrderPriceProps> = props => {
  const { format, base, type, children, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState('')
  useEffect(() => {
    const p = getAmount(base, type, format || 'formatted', order)
    setPrice(p)
    return (): void => {
      setPrice('')
    }
  }, [order])
  const parentProps = {
    price,
    ...p
  }
  return props.children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

BaseOrderPrice.propTypes = BOPProps

BaseOrderPrice.defaultProps = {
  format: 'formatted'
}

export default BaseOrderPrice
