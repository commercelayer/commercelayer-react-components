import PaymentSourceContext, {
  type IconBrand
} from '#context/PaymentSourceContext'
import capitalize from 'lodash/capitalize'
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
  const brandName = cardBrand && capitalize(cardBrand.replace(/_|-/gm, ' '))
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
