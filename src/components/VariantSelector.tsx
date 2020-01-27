import React, { Fragment, FunctionComponent, useContext } from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'
import VariantContext from './context/VariantContext'
import { variantInitialState } from '../reducers/VariantReducer'

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
  const { placeholder, variantLabels, skuCode, name } = props
  const { setSkuCode, currentSkuCode, loading, variants } = useContext(
    VariantContext
  )
  const DefaultTemplate = () =>
    loading ? (
      <Fragment>Loading...</Fragment>
    ) : (
      <VariantTemplate
        variants={variants}
        type={type}
        placeholder={placeholder}
        variantLabels={variantLabels}
        skuCode={currentSkuCode || skuCode}
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
