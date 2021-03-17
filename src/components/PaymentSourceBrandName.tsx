import PaymentSourceContext, { iconBrand } from '#context/PaymentSourceContext'
import { capitalize } from 'lodash'
import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings'

type CustomComponent = FunctionChildren<
  Omit<Props & { brand: iconBrand }, 'children'>
>

type Props = {
  children?: CustomComponent
} & JSX.IntrinsicElements['span']
const PaymentSourceBrandIcon: FunctionComponent<Props> = ({
  children,
  ...props
}) => {
  const { brand } = useContext(PaymentSourceContext)
  const parentProps = {
    brand,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...props}>{capitalize(brand)}</span>
  )
}

export default PaymentSourceBrandIcon
