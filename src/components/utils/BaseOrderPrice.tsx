import OrderContext from '../../context/OrderContext'
import getAmount from '../../utils/getAmount'
import Parent from './Parent'
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import { BaseComponent } from '../../@types'
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

export type BaseOrderComponentProps = InferProps<typeof BOCProps> &
  BaseComponent

export type BaseOrderPriceProps = InferProps<typeof BOPProps> & BaseComponent

const BaseOrderPrice: FunctionComponent<BaseOrderPriceProps> = props => {
  const { format, base, type, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount(base, type, format, order)
    setPrice(p)
    return (): void => {
      setPrice(null)
    }
  }, [order])
  const parentProps = {
    ...p
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

BaseOrderPrice.propTypes = BOPProps

BaseOrderPrice.defaultProps = {
  format: 'formatted'
}

export default BaseOrderPrice
