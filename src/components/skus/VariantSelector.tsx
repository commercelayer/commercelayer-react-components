import { useContext, useEffect, ReactNode } from 'react'
import VariantTemplate, {
  VariantHandleCallback
} from '../utils/VariantTemplate'
import Parent from '../utils/Parent'
import VariantsContext from '#context/VariantsContext'
import { BaseSelectorType } from '#typings'
import { ChildrenFunction } from '#typings/index'
import { VariantsObject, SetSkuCode } from '#reducers/VariantReducer'

export interface VariantOption {
  label: string
  code: string
  lineItem?: {
    name: string
    imageUrl?: string | null
  } | null
}

interface ChildrenProps extends Omit<Props, 'children'> {
  variants: VariantsObject
  handleSelect: SetSkuCode
  loading: boolean
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  options: VariantOption[]
  type?: BaseSelectorType
  loader?: ReactNode
  placeholder?: string
  skuCode?: string
  handleCallback?: VariantHandleCallback
} & JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['select']

export function VariantSelector(props: Props): JSX.Element {
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
    setSkuCodes
  } = useContext(VariantsContext)
  useEffect(() => {
    if (setSkuCodes) setSkuCodes(options)
    return (): void => {
      if (setSkuCodes) setSkuCodes([])
    }
  }, [options.length])
  const sCode = variantSkuCode || skuCode || ''
  const DefaultTemplate = (): JSX.Element =>
    loading ? (
      <>{props.loader || 'Loading...'}</>
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
  console.log('variants', variants, options)
  const parentProps = {
    variants,
    loading: !!loading,
    handleSelect: setSkuCode,
    skuCode: sCode,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <DefaultTemplate />
  )
}

export default VariantSelector
