import PaymentSourceContext, { IconBrand } from '#context/PaymentSourceContext'
import { capitalize } from 'lodash'
import { useContext } from 'react'
import Parent from '#components-utils/Parent'
import { ChildrenFunction } from '#typings'

interface CustomComponent extends Omit<Props, 'children'> {
  brand: IconBrand
}

type Props = {
  children?: ChildrenFunction<CustomComponent>
  label?: string
} & JSX.IntrinsicElements['span']

export function PaymentSourceBrandName({
  children,
  label,
  ...props
}: Props): JSX.Element {
  const { brand } = useContext(PaymentSourceContext)
  const brandName = brand && capitalize(brand.replace('-', ' '))
  const parentProps = {
    brand: brandName,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...props}>{label || capitalize(brandName)}</span>
  )
}

export default PaymentSourceBrandName
