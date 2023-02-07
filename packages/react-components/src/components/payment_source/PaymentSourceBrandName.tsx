import PaymentSourceContext, { IconBrand } from '#context/PaymentSourceContext'
import { capitalize } from 'lodash'
import { useContext } from 'react'
import Parent from '#components/utils/Parent'
import { ChildrenFunction } from '#typings'

interface CustomComponent extends Omit<Props, 'children'> {
  brand: IconBrand
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<CustomComponent>
  label?: string
}

export function PaymentSourceBrandName({
  children,
  label,
  ...props
}: Props): JSX.Element {
  const { brand } = useContext(PaymentSourceContext)
  const brandName = brand && capitalize(brand.replaceAll(/_|-/gm, ' '))
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
