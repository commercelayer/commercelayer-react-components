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
    const { payment } = useContext(PaymentMethodChildrenContext)
    const { order } = useContext(OrderContext)
    const { setPaymentMethod, currentPaymentMethodId } =
      useContext(PaymentMethodContext)
    const [checked, setChecked] = useState(false)
    const orderId = order?.id || ''
    const paymentResource = payment?.paymentSourceType as PaymentResource
    const paymentMethodId = payment?.id as string
    const name = `payment-${orderId}`
    useEffect(() => {
      if (currentPaymentMethodId === payment?.id && !checked) setChecked(true)
      else setChecked(false)
      return () => {
        setChecked(false)
      }
    }, [currentPaymentMethodId, payment])
    const handleOnChange = async () => {
      await setPaymentMethod({ paymentResource, paymentMethodId })
      onChange && onChange(payment)
    }
    const id = payment?.paymentSourceType
    const parentProps = {
      handleOnChange,
      checked,
      id,
      name,
      ...props,
    }
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <input
        type="radio"
        name={name}
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
