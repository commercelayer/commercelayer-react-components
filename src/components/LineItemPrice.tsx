import React, { Fragment, FunctionComponent, useState, useEffect } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk'
import _ from 'lodash'
import getAmount from '../utils/getAmount'

export interface LineItemPriceProps {
  format?: 'formatted' | 'cents' | 'float'
  type?: 'total' | 'option' | 'unit'
  lineItem?: LineItemCollection
}

const LineItemPrice: FunctionComponent<LineItemPriceProps> = props => {
  const { lineItem, format, type } = props
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', type, format, lineItem)
    setPrice(p)
    return () => {
      setPrice('')
    }
  }, [lineItem])

  return <Fragment>{price}</Fragment>
}

LineItemPrice.defaultProps = {
  format: 'formatted',
  type: 'total'
}

export default LineItemPrice
