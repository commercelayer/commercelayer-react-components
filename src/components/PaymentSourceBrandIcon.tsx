import PaymentSourceContext, { IconBrand } from '#context/PaymentSourceContext'
import { FunctionComponent, useContext, useRef } from 'react'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings'
import components from '#config/components'

const propTypes = components.PaymentSourceBrandIcon.propTypes
const displayName = components.PaymentSourceBrandIcon.displayName

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
const PaymentSourceBrandIcon: FunctionComponent<Props> = ({
  src,
  width = 32,
  children,
  ...p
}) => {
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

PaymentSourceBrandIcon.propTypes = propTypes
PaymentSourceBrandIcon.displayName = displayName

export default PaymentSourceBrandIcon
