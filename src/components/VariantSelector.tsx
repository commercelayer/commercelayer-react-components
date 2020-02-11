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

export interface SkuCodePropObj {
  label: string
  code: string
}

export interface VariantSelectorProps extends BaseComponent {
  skuCodes: SkuCodePropObj[]
  name: string
  children?: FunctionComponent
  skuCode?: string
  type?: 'select' | 'radio'
  className?: string
  variants?: object
  loading?: boolean
  placeholder?: string
  loader?: ReactElement
}

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

VariantSelector.defaultProps = {
  placeholder: 'select variant',
  type: 'select'
}

export default VariantSelector
