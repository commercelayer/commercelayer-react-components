import { ReactNode, useContext, useEffect, useState } from 'react'
import Parent from '../utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import PlaceOrderContext from '#context/PlaceOrderContext'
import isFunction from 'lodash/isFunction'
import PaymentMethodContext from '#context/PaymentMethodContext'
import OrderContext from '#context/OrderContext'
import getCardDetails from '#utils/getCardDetails'

const propTypes = components.PlaceOrderButton.propTypes
const defaultProps = components.PlaceOrderButton.defaultProps
const displayName = components.PlaceOrderButton.displayName

type ChildrenProps = FunctionChildren<
  Omit<Props, 'children'> & {
    handleClick: () => Promise<void>
  }
>

type Props = {
  children?: ChildrenProps
  label?: string | ReactNode
  onClick?: (response: { placed: boolean }) => void
} & JSX.IntrinsicElements['button']

export function PlaceOrderButton(props: Props) {
  const { children, label = 'Place order', disabled, onClick, ...p } = props
  const { isPermitted, setPlaceOrder, options, paymentType } =
    useContext(PlaceOrderContext)
  const [notPermitted, setNotPermitted] = useState(true)
  const [forceDisable, setForceDisable] = useState(disabled)
  const {
    currentPaymentMethodRef,
    loading,
    currentPaymentMethodType,
    paymentSource,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const isFree = order?.total_amount_with_taxes_cents === 0
  useEffect(() => {
    if (loading) setNotPermitted(loading)
    else {
      if (paymentType === currentPaymentMethodType && paymentType) {
        const card = getCardDetails({
          customerPayment: { payment_source: paymentSource },
          paymentType,
        })
        if (
          ((isFree && isPermitted) ||
            currentPaymentMethodRef?.current?.onsubmit ||
            card.brand) &&
          isPermitted
        ) {
          setNotPermitted(false)
        }
      } else if (isFree && isPermitted) {
        setNotPermitted(false)
      } else {
        setNotPermitted(true)
      }
    }
    return () => {
      setNotPermitted(true)
    }
  }, [
    isPermitted,
    paymentType,
    currentPaymentMethodRef?.current?.onsubmit,
    loading,
    currentPaymentMethodType,
    order,
    paymentSource,
  ])
  useEffect(() => {
    if (
      paymentType === 'paypal_payments' &&
      options?.paypalPayerId &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status)
    ) {
      void handleClick()
    }
  }, [options?.paypalPayerId, paymentType])
  useEffect(() => {
    if (
      paymentType === 'adyen_payments' &&
      options?.adyen?.MD &&
      options?.adyen?.PaRes &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status)
    ) {
      void handleClick()
    }
  }, [options?.adyen, paymentType])
  useEffect(() => {
    if (
      paymentType === 'checkout_com_payments' &&
      options?.checkoutCom?.session_id &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status)
    ) {
      void handleClick()
    }
  }, [options?.checkoutCom, paymentType])
  const handleClick = async () => {
    let isValid = true
    setForceDisable(true)
    const card =
      paymentType &&
      getCardDetails({
        paymentType,
        customerPayment: { payment_source: paymentSource },
      })
    if (
      currentPaymentMethodRef?.current?.onsubmit &&
      [
        !options?.paypalPayerId,
        !options?.adyen?.MD,
        !options?.checkoutCom?.session_id,
      ].every(Boolean)
    ) {
      // @ts-ignore
      isValid = (await currentPaymentMethodRef.current?.onsubmit(
        // @ts-ignore
        paymentSource
      )) as boolean
    } else if (card?.brand) {
      isValid = true
    }
    const placed =
      isValid &&
      setPlaceOrder &&
      (paymentSource || isFree) &&
      (await setPlaceOrder({ paymentSource: paymentSource }))
    setForceDisable(false)
    onClick && placed && onClick(placed)
  }
  const disabledButton = disabled !== undefined ? disabled : notPermitted
  const parentProps = {
    ...p,
    label,
    disabled: disabledButton,
    handleClick,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={disabledButton || forceDisable}
      onClick={handleClick}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

PlaceOrderButton.propTypes = propTypes
PlaceOrderButton.defaultProps = defaultProps
PlaceOrderButton.displayName = displayName

export default PlaceOrderButton
