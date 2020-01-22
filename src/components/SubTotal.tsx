import React, { FunctionComponent, useState, useEffect } from 'react'
import { GeneralComponent } from '../@types/index'
import { OrderCollection } from '@commercelayer/js-sdk'
import getAmount from '../utils/getAmount'

export interface SubTotalProps extends GeneralComponent {
  order?: OrderCollection
  format?: 'formatted' | 'cents' | 'float'
}

const SubTotal: FunctionComponent<SubTotalProps> = props => {
  const { order, format, className, style } = props
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', 'subtotal', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return (
    <span style={style} className={className}>
      {price}
    </span>
  )
}

SubTotal.defaultProps = {
  format: 'formatted'
}

export default SubTotal
