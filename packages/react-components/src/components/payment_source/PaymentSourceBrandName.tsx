import PaymentSourceContext, {
  type IconBrand
} from '#context/PaymentSourceContext'
import { useContext, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings'
import CustomerPaymentSourceContext from '#context/CustomerPaymentSourceContext'

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
  const { brand: customerCardBrand } = useContext(CustomerPaymentSourceContext)
  const cardBrand = brand ?? customerCardBrand
  const capitalizeStr = (str?: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''
  const brandName = cardBrand && capitalizeStr(cardBrand.replace(/_|-/gm, ' '))
  const parentProps = {
    brand: brandName,
    label,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...props}>{label || capitalizeStr(brandName)}</span>
  )
}

export default PaymentSourceBrandName
