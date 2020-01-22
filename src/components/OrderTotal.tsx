import React, { Fragment, useEffect, useState } from 'react'
import getAmount from '../utils/getAmount'

export interface TotalProps {
  format?: 'formatted' | 'cents' | 'float'
}

const Total = props => {
  const { order, format, className, style } = props
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', 'total', format, order)
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

Total.defaultProps = {
  format: 'formatted'
}

export default Total
