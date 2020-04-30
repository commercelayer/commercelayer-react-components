import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect,
  ReactElement,
} from 'react'
import VariantTemplate from './VariantTemplate'
import Parent from './utils/Parent'
import VariantsContext from '../context/VariantsContext'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.VariantSelector.propTypes
const defaultProps = components.VariantSelector.defaultProps
const displayName = components.VariantSelector.displayName

export interface SkuCodePropObj {
  label: string
  code: string
}

export type VariantSelectorProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['select']

const VariantSelector: FunctionComponent<VariantSelectorProps> = (props) => {
  const { children, type, placeholder, skuCode, name, skuCodes, ...prs } = props
  const {
    setSkuCode,
    skuCode: variantSkuCode,
    loading,
    variants,
    setSkuCodes,
  } = useContext(VariantsContext)
  useEffect(() => {
    setSkuCodes && setSkuCodes(skuCodes)
    return (): void => {
      setSkuCodes && setSkuCodes([])
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
        placeholder={placeholder as string}
        skuCode={sCode}
        skuCodes={skuCodes}
        onChange={setSkuCode as any}
        name={name as string}
        {...prs}
      />
    )
  const parentProps = {
    variants,
    loading,
    skuCodes,
    handleSelect: setSkuCode,
    skuCode: sCode,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>
      <DefaultTemplate />
    </Fragment>
  )
}

VariantSelector.propTypes = propTypes
VariantSelector.defaultProps = defaultProps
VariantSelector.displayName = displayName

export default VariantSelector
