import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect
} from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'
import VariantContext from './context/VariantContext'
import { GeneralComponent } from '../@types/index'
import { setSkuCodeInterface } from '../reducers/VariantReducer'

export interface VariantSelectorProps extends GeneralComponent {
  skuCodes: string[]
  name: string
  children?: any
  skuCode?: string
  type?: 'select' | 'radio'
  setSkuCode?: setSkuCodeInterface
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
  const { placeholder, variantLabels, skuCode, name, skuCodes, ...prs } = props
  const {
    setSkuCode,
    currentSkuCode,
    loading,
    variants,
    setSkuCodes
  } = useContext(VariantContext)
  useEffect(() => {
    setSkuCodes(skuCodes)
    return () => {
      setSkuCodes([])
    }
  }, [skuCodes])
  const sCode = currentSkuCode || skuCode
  const DefaultTemplate = () =>
    loading ? (
      <Fragment>Loading...</Fragment>
    ) : (
      <VariantTemplate
        variants={variants}
        type={type}
        placeholder={placeholder}
        variantLabels={variantLabels}
        skuCode={sCode}
        onChange={setSkuCode}
        name={name}
        {...prs}
      />
    )
  const parentProps = {
    variants,
    loading,
    variantLabels,
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
  placeholder: 'select your size',
  variantLabels: [],
  type: 'select'
}

export default VariantSelector
