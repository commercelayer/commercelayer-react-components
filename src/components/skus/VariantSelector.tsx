import { Fragment, useContext, useEffect, ReactElement } from 'react'
import VariantTemplate, {
  VariantHandleCallback,
} from '#components-utils/VariantTemplate'
import Parent from '#components-utils/Parent'
import VariantsContext from '#context/VariantsContext'

import { BaseSelectorType } from '#typings'
import { FunctionChildren } from '#typings/index'
import { VariantsObject, SetSkuCode } from '#reducers/VariantReducer'

export interface VariantOption {
  label: string
  code: string
  lineItem?: {
    name: string
    imageUrl?: string | null
  } | null
}

type ChildrenProps = FunctionChildren<
  Omit<Props, 'children'> & {
    variants: VariantsObject
    handleSelect: SetSkuCode
    loading: boolean
  }
>

type Props = {
  children?: ChildrenProps
  options: VariantOption[]
  type?: BaseSelectorType
  loader?: JSX.Element
  placeholder?: string
  skuCode?: string
  handleCallback?: VariantHandleCallback
} & JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['select']

export function VariantSelector(props: Props) {
  const {
    children,
    type = 'select',
    placeholder,
    skuCode,
    name,
    options,
    ...prs
  } = props
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

export default VariantSelector
