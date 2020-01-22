import React, { useState, useEffect, FunctionComponent } from 'react'
import Parent from './utils/Parent'
import getChildrenProp from '../utils/getChildrenProp'
import { Sku } from '@commercelayer/js-sdk'
import getSkus from '../utils/getSkus'

export interface VariantContainerProps {
  children: any
  skuCode?: string
  accessToken?: string
}

const VariantContainer: FunctionComponent<VariantContainerProps> = ({
  children,
  skuCode,
  ...props
}) => {
  // TODO: Refactor with useReducer
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState({})
  const [currentSkuCode, setCurrentSkuCode] = useState('')
  const [currentSkuId, setCurrentSkuId] = useState('')
  const [currentSkuInventory, setCurrentSkuInventory] = useState({})
  const skuCodes = getChildrenProp(children, 'skuCodes')
  const parentProps = {
    loading,
    variants,
    skuId: currentSkuId,
    skuCode: currentSkuCode || skuCode,
    currentSkuInventory,
    setSkuCode: (code: string, id: string): void => {
      setCurrentSkuCode(code)
      setCurrentSkuId(id)
      Sku.find(id).then(s => {
        setCurrentSkuInventory(s.inventory)
      })
    },
    ...props
  }
  useEffect(() => {
    setLoading(true)
    if (skuCode) {
      setCurrentSkuCode(skuCode)
    }
    if (skuCodes.length >= 1 && props.accessToken) {
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
  return <Parent {...parentProps}>{children}</Parent>
}

export default VariantContainer
