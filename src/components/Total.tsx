import React, { Fragment, useEffect, useState, useContext } from 'react'
import getAmount from '../utils/getAmount'
import OrderContext from './context/OrderContext'

export interface TotalProps {
  format?: 'formatted' | 'cents' | 'float'
}

const Total = props => {
  const { format, className, style } = props
  const { order } = useContext(OrderContext)
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
