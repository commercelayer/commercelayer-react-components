import PaymentSourceContext, { iconBrand } from '#context/PaymentSourceContext'
import { capitalize } from 'lodash'
import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings'
import components from '#config/components'

const propTypes = components.PaymentSourceBrandName.propTypes
const displayName = components.PaymentSourceBrandName.displayName

type CustomComponent = FunctionChildren<
  Omit<Props & { brand: iconBrand }, 'children'>
>

type Props = {
  children?: CustomComponent
  label?: string
} & JSX.IntrinsicElements['span']
const PaymentSourceBrandName: FunctionComponent<Props> = ({
  children,
  label,
  ...props
}) => {
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

PaymentSourceBrandName.propTypes = propTypes
PaymentSourceBrandName.displayName = displayName

export default PaymentSourceBrandName
