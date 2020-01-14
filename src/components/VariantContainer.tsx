import React, { useState, useEffect } from 'react'
import Parent from './utils/Parent'
import getChildrenProp from '../utils/getChildrenProp'
import { Sku } from '@commercelayer/js-sdk'
import getSkus from '../utils/getSkus'

export interface VariantContainerProps {
  children: any
  skuCode?: string
  accessToken?: string
}

export default function VariantContainer({
  children,
  ...props
}: VariantContainerProps) {
  const { skuCode } = props
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState({})
  const [currentSkuCode, setCurrentSkuCode] = useState('')
  const skuCodes = getChildrenProp(children, 'skuCodes')
  console.log('skuCode', currentSkuCode, skuCode)
  const parentProps = {
    loading,
    variants,
    currentSkuCode,
    setCurrentSkuCode,
    ...props
  }
  useEffect(() => {
    setLoading(true)
    if (skuCode) {
      setCurrentSkuCode(skuCode)
    }
    if (skuCodes.length >= 1 && props.accessToken) {
      console.log('--- getSkus ---')
      Sku.where({ codeIn: skuCodes.join(',') })
        .perPage(25)
        .all()
        .then(r => {
          const skusObj = getSkus(r.toArray())
          setVariants(skusObj)
          setLoading(false)
        })
    }
    return () => {
      setVariants({})
      setCurrentSkuCode('')
      setLoading(false)
    }
  }, [props.accessToken])
  console.log('parentProps', parentProps)
  return <Parent {...parentProps}>{children}</Parent>
}
