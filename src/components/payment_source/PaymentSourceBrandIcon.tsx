import PaymentSourceContext, { IconBrand } from '#context/PaymentSourceContext'
import { useContext, useRef } from 'react'
import Parent from '#components-utils/Parent'
import { ChildrenFunction } from '#typings'

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
  const { brand } = useContext(PaymentSourceContext)
  const ref = useRef<HTMLImageElement>(null)
  const defaultSrc =
    '//data.commercelayer.app/assets/images/icons/credit-cards/color/credit-card.svg'
  const url =
    src ||
    `//data.commercelayer.app/assets/images/icons/credit-cards/color/${
      brand ?? 'credit-card'
    }.svg`
  const handleError = (): void => {
    if (ref.current) ref.current.src = defaultSrc
  }
  const parentProps = {
    brand,
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
