import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect,
  ReactElement
} from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'
import VariantContext from './context/VariantContext'
import { GeneralComponent } from '../@types/index'
import { SetSkuCodesVariant } from '../reducers/VariantReducer'

export interface SkuCodePropObj {
  label: string
  code: string
}

export interface VariantSelectorProps extends GeneralComponent {
  skuCodes: SkuCodePropObj[]
  name: string
  children?: FunctionComponent
  skuCode?: string
  type?: 'select' | 'radio'
  setSkuCode?: SetSkuCodesVariant
  className?: string
  variants?: object
  loading?: boolean
  placeholder?: string
}

const VariantSelector: FunctionComponent<VariantSelectorProps> = ({
  children,
  type,
  ...props
}) => {
  const { placeholder, skuCode, name, skuCodes, ...prs } = props
  const {
    setSkuCode,
    currentSkuCode,
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
  const sCode = currentSkuCode || skuCode
  const DefaultTemplate = (): ReactElement =>
    loading ? (
      <Fragment>Loading...</Fragment>
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
