import React, { Fragment, FunctionComponent } from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'

export interface VariantSelectorProps {
  skuCodes: string[]
  name: string
  children?: any
  skuCode?: string
  type?: 'select' | 'radio'
  setSkuCode?: () => void
  className?: string
  variants?: object
  loading?: boolean
  placeholder?: string
  variantLabels?: string[]
}

const VariantSelector: FunctionComponent<VariantSelectorProps> = ({
  children,
  type,
  ...props
}) => {
  const {
    variants,
    loading,
    placeholder,
    variantLabels,
    skuCode,
    setSkuCode,
    name
  } = props
  const DefaultTemplate = () =>
    loading ? (
      <Fragment>Loading...</Fragment>
    ) : (
      <VariantTemplate
        variants={variants}
        type={type}
        placeholder={placeholder}
        variantLabels={variantLabels}
        skuCode={skuCode}
        onChange={setSkuCode}
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

export default VariantSelector
