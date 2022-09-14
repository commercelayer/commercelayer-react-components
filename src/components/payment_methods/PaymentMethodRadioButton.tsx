import { useContext, ChangeEvent } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from '#components-utils/Parent'
import components from '#config/components'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentMethod } from '@commercelayer/sdk'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'

const propTypes = components.PaymentMethodRadioButton.propTypes
const displayName = components.PaymentMethodRadioButton.displayName

type ShippingMethodRadioButtonChildrenProps = Omit<Props, 'children'> & {
  checked: boolean
  handleOnChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

type Props = {
  children?: (props: ShippingMethodRadioButtonChildrenProps) => JSX.Element
  onChange?: (payment?: PaymentMethod | Record<string, any>) => void
} & JSX.IntrinsicElements['input']

export function PaymentMethodRadioButton(props: Props) {
  const { onChange, ...p } = props
  const { payment, paymentSelected, setPaymentSelected, clickableContainer } =
    useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const { setPaymentMethod, setLoading } = useContext(PaymentMethodContext)
  const orderId = order?.id || ''
  const paymentResource = payment?.payment_source_type as PaymentResource
  const paymentMethodId = payment?.id as string
  const name = `payment-${orderId}`
  const checked = paymentSelected === payment?.id
  const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setPaymentSelected && setPaymentSelected(paymentMethodId)
    setLoading({ loading: true })
    !clickableContainer &&
      (await setPaymentMethod({ paymentResource, paymentMethodId }))
    onChange && onChange(payment)
    setLoading({ loading: false })
  }
  const id = payment?.payment_source_type
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
      title={name}
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
