import React, { FunctionComponent, useState, useEffect } from 'react'
import { GeneralComponent } from '../@types/index'
import { OrderCollection } from '@commercelayer/js-sdk'
import getAmount from '../utils/getAmount'

export interface DiscountProps extends GeneralComponent {
  order?: OrderCollection
  format?: 'formatted' | 'cents' | 'float'
}

const Discount: FunctionComponent<DiscountProps> = props => {
  const { order, format, ...p } = props
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', 'discount', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return <span {...p}>{price}</span>
}

Discount.defaultProps = {
  format: 'formatted'
}

export default Discount
