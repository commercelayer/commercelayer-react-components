import OrderContext from '#context/OrderContext'
import getAmount from '#utils/getAmount'
import Parent from './Parent'
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from 'react'
import { PropsType } from '#utils/PropsType'
import { baseOrderPricePropTypes } from '#typings'
import { isEmpty } from 'lodash'

export type BaseOrderPriceProps = PropsType<typeof baseOrderPricePropTypes> &
  JSX.IntrinsicElements['span']

const BaseOrderPrice: FunctionComponent<BaseOrderPriceProps> = (props) => {
  const { format, base, type, children, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState('')
  useEffect(() => {
    const p = getAmount(
      base,
      type,
      format || 'formatted',
      order || {}
    ) as string
    setPrice(p)
    return (): void => {
      if (isEmpty(order)) {
        setPrice('')
      }
    }
  }, [order])
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

BaseOrderPrice.propTypes = baseOrderPricePropTypes
BaseOrderPrice.defaultProps = {
  format: 'formatted',
}

export default BaseOrderPrice
