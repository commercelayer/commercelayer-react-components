import { useContext, ChangeEvent } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from '#components/utils/Parent'
import PaymentMethodContext from '#context/PaymentMethodContext'
import type { Order, PaymentMethod } from '@commercelayer/sdk'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'
import useCustomContext from '#utils/hooks/useCustomContext'
import { ChildrenFunction } from '#typings/index'

interface ChildrenProps extends Omit<Props, 'children'> {
  checked: boolean
  handleOnChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

interface TOnChangeParams {
  payment?: PaymentMethod | Record<string, any>
  order?: Order
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
  onChange?: (params: TOnChangeParams) => void
} & JSX.IntrinsicElements['input']

export function PaymentMethodRadioButton(props: Props): JSX.Element {
  const { onChange, ...p } = props
  const { payment, paymentSelected, setPaymentSelected, clickableContainer } =
    useCustomContext({
      context: PaymentMethodChildrenContext,
      contextComponentName: 'PaymentMethod',
      currentComponentName: 'PaymentMethodRadioButton',
      key: 'payment'
    })
  const { order } = useContext(OrderContext)
  const { setPaymentMethod, setLoading } = useContext(PaymentMethodContext)
  const orderId = order?.id || ''
  const paymentResource = payment?.payment_source_type as PaymentResource
  const paymentMethodId = payment?.id as string
  const name = `payment-${orderId}`
  const checked = paymentSelected === payment?.id
  const handleOnChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    e.stopPropagation()
    if (setPaymentSelected) setPaymentSelected(paymentMethodId)
    setLoading({ loading: true })
    if (!clickableContainer) {
      const { order } = await setPaymentMethod({
        paymentResource,
        paymentMethodId
      })
      if (onChange) onChange({ payment, order })
    }
    setLoading({ loading: false })
  }
  const id = payment?.payment_source_type
  const parentProps = {
    handleOnChange,
    checked,
    id,
    name,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <input
      title={name}
      type='radio'
      id={id}
      onChange={(e) => {
        void handleOnChange(e)
      }}
      checked={checked}
      {...p}
    />
  )
}

export default PaymentMethodRadioButton
