import PaymentSourceContext, { IconBrand } from '#context/PaymentSourceContext'
import { useContext, useRef } from 'react'
import Parent from '#components-utils/Parent'
import { FunctionChildren } from '#typings'

type CustomComponent = FunctionChildren<
  Omit<
    Props & { brand: IconBrand; defaultSrc: string; url: string },
    'children'
  >
>

type Props = {
  children?: CustomComponent
  width?: number
  height?: number
} & JSX.IntrinsicElements['img']
export function PaymentSourceBrandIcon({
  src,
  width = 32,
  children,
  ...p
}: Props) {
  const { brand } = useContext(PaymentSourceContext)
  const ref = useRef<HTMLImageElement>(null)
  const defaultSrc =
    '//data.commercelayer.app/assets/images/icons/credit-cards/color/credit-card.svg'
  const url = src
    ? src
    : `//data.commercelayer.app/assets/images/icons/credit-cards/color/${brand}.svg`
  const handleError = () => {
    if (ref.current) ref.current.src = defaultSrc
  }
  const parentProps = {
    brand,
    defaultSrc,
    url,
    width,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <img ref={ref} src={url} onError={handleError} width={width} {...p} />
  )
}

export default PaymentSourceBrandIcon
