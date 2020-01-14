import React, { Fragment } from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'

export interface VariantSelectorProps {
  skuCodes: string[]
  name: string
  children?: any
  currentSkuCode?: string
  type?: 'select' | 'radio'
  setCurrentSkuCode?: () => void
  className?: string
  variants?: object
  loading?: boolean
  placeholder?: string
  variantLabels?: string[]
}

export default function VariantSelector({
  children,
  type,
  ...props
}: VariantSelectorProps) {
  const {
    variants,
    loading,
    placeholder,
    variantLabels,
    currentSkuCode,
    setCurrentSkuCode,
    name
  } = props
  console.log('--- skuCode VARIANT SELECTOR ---', currentSkuCode)
  const DefaultTemplate = () =>
    loading ? (
      <Fragment>Loading...</Fragment>
    ) : (
      <VariantTemplate
        variants={variants}
        type={type}
        placeholder={placeholder}
        variantLabels={variantLabels}
        skuCode={currentSkuCode}
        onChange={setCurrentSkuCode}
        name={name}
      />
    )
  return children ? (
    <Parent {...props}>{children}</Parent>
  ) : (
    <Fragment>
      <DefaultTemplate />
    </Fragment>
  )
}

VariantSelector.defaultProps = {
  placeholder: 'select your size',
  variantLabels: [],
  type: 'select'
}
