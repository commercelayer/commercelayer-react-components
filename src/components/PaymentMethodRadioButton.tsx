import React, { useContext, FunctionComponent, ReactNode } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentMethodCollection } from '@commercelayer/js-sdk'
import { PaymentResource } from '../reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'

const propTypes = components.PaymentMethodRadioButton.propTypes
const displayName = components.PaymentMethodRadioButton.displayName

type ShippingMethodRadioButtonChildrenProps = Omit<
  ShippingMethodRadioButtonProps,
  'children'
>

type ShippingMethodRadioButtonProps = {
  children?: (props: ShippingMethodRadioButtonChildrenProps) => ReactNode
  onChange?: (payment?: PaymentMethodCollection | Record<string, any>) => void
} & JSX.IntrinsicElements['input']

const PaymentMethodRadioButton: FunctionComponent<ShippingMethodRadioButtonProps> = (
  props
) => {
  const { onChange, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const { setPaymentMethod, currentPaymentMethodId } = useContext(
    PaymentMethodContext
  )
  const orderId = order?.id || ''
  const paymentResource = payment?.paymentSourceType as PaymentResource
  const paymentMethodId = payment?.id as string
  const name = `payment-${orderId}`
  const checked = currentPaymentMethodId === payment?.id
  const handleOnChange = async () => {
    await setPaymentMethod({ paymentResource, paymentMethodId })
    onChange && onChange(payment)
  }
  const parentProps = {
    handleOnChange,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <input
      type="radio"
      name={name}
      onChange={handleOnChange}
      defaultChecked={checked}
      {...p}
    />
  )
}

PaymentMethodRadioButton.propTypes = propTypes
PaymentMethodRadioButton.displayName = displayName

export default PaymentMethodRadioButton
