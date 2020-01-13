import React, { useState, useEffect } from 'react'
import Parent from './utils/Parent'
import getChildrenProp from '../utils/getChildrenProp'
import { Sku } from '@commercelayer/js-sdk'

export interface VariantContainerProps {
  skuCode?: string
}

export default function VariantContainer({ children, ...props }) {
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState('')
  const [skuCode, setSkuCode] = useState('')
  let skuCodes = []
  if (!props.skuCode) {
    skuCodes = getChildrenProp(children, 'skuCodes')
  } else {
    skuCodes.push(props.skuCode)
  }
  console.log('VARIANT props', props, skuCodes)
  useEffect(() => {
    // TODO: get variant
    setLoading(true)
    if (skuCodes.length >= 1 && props.accessToken) {
      Sku.where({ codeIn: skuCodes.join(',') })
        .perPage(25)
        .all()
        .then(r => {
          console.log('SKU response', r)
          // const pricesObj = getPrices(r.toArray())
          // setPrices(pricesObj)
          setLoading(false)
        })
    }
    return () => {
      setVariants('')
    }
  }, [props.accessToken])
  const parentProps = {
    loading,
    variants,
    skuCode,
    setSkuCode,
    ...props
  }
  return <Parent {...parentProps}>{children}</Parent>
}
