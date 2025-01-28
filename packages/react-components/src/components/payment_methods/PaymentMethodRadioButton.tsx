import { useContext, useEffect, useState, type ChangeEvent, type JSX } from 'react';
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from '#components/utils/Parent'
import PaymentMethodContext from '#context/PaymentMethodContext'
import type { Order, PaymentMethod } from '@commercelayer/sdk'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import OrderContext from '#context/OrderContext'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { ChildrenFunction } from '#typings/index'
import PlaceOrderContext from '#context/PlaceOrderContext'

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
  const { status } = useContext(PlaceOrderContext)
  const [disabled, setDisabled] = useState(false)
  const orderId = order?.id || ''
  const paymentResource = payment?.payment_source_type as PaymentResource
  const paymentMethodId = payment?.id ?? ''
  const name = `payment-${orderId}`
  const checked = paymentSelected === payment?.id
  useEffect(() => {
    if (status === 'placing') {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [status])

  const handleOnChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    e.stopPropagation()
    if (checked) return
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
    disabled,
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
        handleOnChange(e)
      }}
      checked={checked}
      disabled={disabled}
      {...p}
    />
  )
}

export default PaymentMethodRadioButton
