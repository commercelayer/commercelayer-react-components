import React, {
  useContext,
  FunctionComponent,
  ReactNode,
  useState,
  useEffect,
} from 'react'
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
> & { checked: boolean }

type ShippingMethodRadioButtonProps = {
  children?: (props: ShippingMethodRadioButtonChildrenProps) => ReactNode
  onChange?: (payment?: PaymentMethodCollection | Record<string, any>) => void
} & JSX.IntrinsicElements['input']

const PaymentMethodRadioButton: FunctionComponent<ShippingMethodRadioButtonProps> =
  (props) => {
    const { onChange, ...p } = props
    const { payment, paymentSelected, setPaymentSelected } = useContext(
      PaymentMethodChildrenContext
    )
    const { order } = useContext(OrderContext)
    const { setPaymentMethod, setLoading } = useContext(PaymentMethodContext)
    const orderId = order?.id || ''
    const paymentResource = payment?.paymentSourceType as PaymentResource
    const paymentMethodId = payment?.id as string
    const name = `payment-${orderId}`
    const checked = paymentSelected === payment?.id
    const handleOnChange = async () => {
      setPaymentSelected && setPaymentSelected(paymentMethodId)
      setLoading({ loading: true })
      await setPaymentMethod({ paymentResource, paymentMethodId })
      onChange && onChange(payment)
      setLoading({ loading: false })
    }
    const id = payment?.paymentSourceType
    const parentProps = {
      handleOnChange,
      checked,
      id,
      name,
      ...props,
    }
    console.log(`checked`, checked)
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <input
        type="radio"
        id={id}
        onChange={handleOnChange}
        checked={checked}
        {...p}
      />
    )
  }

PaymentMethodRadioButton.propTypes = propTypes
PaymentMethodRadioButton.displayName = displayName

export default PaymentMethodRadioButton
