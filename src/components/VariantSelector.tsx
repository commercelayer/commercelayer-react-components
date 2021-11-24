import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect,
  ReactElement,
  ReactNode,
} from 'react'
import VariantTemplate, { VariantHandleCallback } from './utils/VariantTemplate'
import Parent from './utils/Parent'
import VariantsContext from '#context/VariantsContext'
import components from '#config/components'
import { BaseSelectorType } from '#typings'
import { FunctionChildren } from '#typings/index'
import { VariantsObject, SetSkuCode } from '#reducers/VariantReducer'

const propTypes = components.VariantSelector.propTypes
const defaultProps = components.VariantSelector.defaultProps
const displayName = components.VariantSelector.displayName

export interface VariantOption {
  label: string
  code: string
  lineItem?: {
    name: string
    imageUrl?: string | null
  } | null
}

type VariantSelectorChildrenProps = FunctionChildren<
  Omit<VariantSelectorProps, 'children'> & {
    variants: VariantsObject
    handleSelect: SetSkuCode
    loading: boolean
  }
>

type VariantSelectorProps = {
  children?: VariantSelectorChildrenProps
  options: VariantOption[]
  type?: BaseSelectorType
  loader?: ReactNode
  placeholder?: string
  skuCode?: string
  handleCallback?: VariantHandleCallback
} & JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['select']

const VariantSelector: FunctionComponent<VariantSelectorProps> = (props) => {
  const { children, type, placeholder, skuCode, name, options, ...prs } = props
  const {
    setSkuCode,
    skuCode: variantSkuCode,
    loading,
    variants,
    setSkuCodes,
  } = useContext(VariantsContext)
  useEffect(() => {
    setSkuCodes && setSkuCodes(options)
    return (): void => {
      setSkuCodes && setSkuCodes([])
    }
  }, [options])
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
        options={options}
        handleChange={setSkuCode}
        name={name as string}
        {...prs}
      />
    )
  const parentProps = {
    variants,
    loading: !!loading,
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
