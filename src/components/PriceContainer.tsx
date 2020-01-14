import React, { useState, useEffect, ReactElement } from 'react'
import { Sku } from '@commercelayer/js-sdk'
import Parent from './utils/Parent'
import getPrices from '../utils/getPrices'
import getChildrenProp from '../utils/getChildrenProp'
import _ from 'lodash'

export interface PriceContainerProps {
  children: any
  accessToken?: string
  skuCode?: string
}

export default function PriceContainer({
  children,
  ...props
}: PriceContainerProps) {
  const { skuCode } = props
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState({})
  const skuCodes = getChildrenProp(children, 'skuCode')
  if (_.indexOf(skuCodes, skuCode) === -1) skuCodes.push(skuCode)
  if (skuCodes)
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
      return () => {
        setPrices({})
      }
    }, [props.accessToken])
  const parentProps = {
    loading,
    prices,
    ...props
  }
  return <Parent {...parentProps}>{children}</Parent>
}
