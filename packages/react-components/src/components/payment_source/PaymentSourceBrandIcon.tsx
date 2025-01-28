import PaymentSourceContext, {
  type IconBrand
} from '#context/PaymentSourceContext'
import { useContext, useRef, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings'
import CustomerPaymentSourceContext from '#context/CustomerPaymentSourceContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  brand: IconBrand
  defaultSrc: string
  url: string
}

interface Props extends Omit<JSX.IntrinsicElements['img'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  width?: number
  height?: number
}
export function PaymentSourceBrandIcon({
  src,
  width = 32,
  children,
  ...p
}: Props): JSX.Element {
  const { brand, issuer_type: issuerType } = useContext(PaymentSourceContext)
  const { brand: customerCardBrand, issuer_type: customerIssuerType } =
    useContext(CustomerPaymentSourceContext)
  const cardBrand =
    brand ?? customerCardBrand ?? issuerType ?? customerIssuerType
  const ref = useRef<HTMLImageElement>(null)
  const defaultSrc =
    '//data.commercelayer.app/assets/images/icons/credit-cards/color/credit-card.svg'
  const url =
    src ||
    `//data.commercelayer.app/assets/images/icons/credit-cards/color/${
      cardBrand ?? 'credit-card'
    }.svg`
  const handleError = (): void => {
    if (ref.current) ref.current.src = defaultSrc
  }
  const parentProps = {
    brand: cardBrand,
    defaultSrc,
    url,
    width,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <img ref={ref} src={url} onError={handleError} width={width} {...p} />
  )
}

export default PaymentSourceBrandIcon
