import React from 'react'

export interface VariantSelectorProps {
  children?: any
  skuCodes?: string[]
  skuCode?: string
  type: 'select' | 'radio'
  setSkuCode?: () => void
  className?: string
}

export default function VariantSelector({
  children,
  type,
  ...props
}: VariantSelectorProps) {
  const options = props.skuCodes.map(sku => {
    if (type === 'select') {
      return null
    }
  })
  return null
}
