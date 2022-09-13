import PaymentSourceContext, { IconBrand } from '#context/PaymentSourceContext'
import { capitalize } from 'lodash'
import { useContext } from 'react'
import Parent from '#components-utils/Parent'
import { FunctionChildren } from '#typings'

type CustomComponent = FunctionChildren<
  Omit<Props & { brand: IconBrand }, 'children'>
>

type Props = {
  children?: CustomComponent
  label?: string
} & JSX.IntrinsicElements['span']
export function PaymentSourceBrandName({ children, label, ...props }: Props) {
  const { brand } = useContext(PaymentSourceContext)
  const brandName = brand && capitalize(brand.replace('-', ' '))
  const parentProps = {
    brand: brandName,
    label,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...props}>{label || capitalize(brandName)}</span>
  )
}

export default PaymentSourceBrandName
