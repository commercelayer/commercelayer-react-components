import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect,
  ReactElement
} from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'
import VariantContext from '../context/VariantContext'
import { BaseComponent } from '../@types/index'
import PropTypes, { InferProps } from 'prop-types'

export interface SkuCodePropObj {
  label: string
  code: string
}

export const VSProps = {
  skuCodes: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.func,
  type: PropTypes.oneOf(['select', 'radio']),
  loader: PropTypes.element,
  placeholder: PropTypes.string,
  skuCode: PropTypes.string
}

export type VariantSelectorProps = InferProps<typeof VSProps> & BaseComponent

const VariantSelector: FunctionComponent<VariantSelectorProps> = props => {
  const { children, type, placeholder, skuCode, name, skuCodes, ...prs } = props
  const {
    setSkuCode,
    skuCode: variantSkuCode,
    loading,
    variants,
    setSkuCodes
  } = useContext(VariantContext)
  useEffect(() => {
    setSkuCodes(skuCodes)
    return (): void => {
      setSkuCodes([])
    }
  }, [skuCodes])
  const sCode = variantSkuCode || skuCode || ''
  const DefaultTemplate = (): ReactElement =>
    loading ? (
      <Fragment>{props.loader || 'Loading...'}</Fragment>
    ) : (
      <VariantTemplate
        variants={variants}
        type={type}
        placeholder={placeholder}
        skuCode={sCode}
        skuCodes={skuCodes}
        onChange={setSkuCode}
        name={name}
        {...prs}
      />
    )
  const parentProps = {
    variants,
    loading,
    skuCodes,
    setSkuCode,
    skuCode: sCode,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>
      <DefaultTemplate />
    </Fragment>
  )
}

VariantSelector.propTypes = VSProps

VariantSelector.defaultProps = {
  placeholder: 'select variant',
  type: 'select'
}

export default VariantSelector
