import React, { useState, useEffect, ReactElement } from 'react'
import { Sku } from '@commercelayer/js-sdk'
import Parent from './utils/Parent'
import getPrices from '../utils/getPrices'
import getChildrenProp from '../utils/getChildrenProp'

// TODO: Adding preselect skuCode

export interface PriceContainerProps {
  children: any
  accessToken?: string
  skuCode?: string
}

export default function PriceContainer({
  children,
  ...props
}: PriceContainerProps) {
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState({})
  const skuCodes = []
  if (!props.skuCode) {
    const skus = getChildrenProp(children, 'skuCode')
    skuCodes.push(skus)
  } else {
    skuCodes.push(props.skuCode)
  }
  useEffect(() => {
    setLoading(true)
    if (skuCodes.length >= 1 && props.accessToken) {
      Sku.where({ codeIn: skuCodes.join(',') })
        .includes('prices')
        .perPage(25)
        .all()
        .then(r => {
          const pricesObj = getPrices(r.toArray())
          setPrices(pricesObj)
          setLoading(false)
        })
    }
  }, [props.accessToken])
  const parentProps = {
    loading,
    prices,
    ...props
  }
  return <Parent {...parentProps}>{children}</Parent>
}
