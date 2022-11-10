import { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import Parent from '../utils/Parent'
import { ChildrenFunction } from '#typings/index'
import PlaceOrderContext from '#context/PlaceOrderContext'
import isFunction from 'lodash/isFunction'
import PaymentMethodContext from '#context/PaymentMethodContext'
import OrderContext from '#context/OrderContext'
import getCardDetails from '#utils/getCardDetails'

interface ChildrenProps extends Omit<Props, 'children'> {
  handleClick: () => Promise<void>
}

interface Props
  extends Omit<JSX.IntrinsicElements['button'], 'children' | 'onClick'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: (response: { placed: boolean }) => void
}

export function PlaceOrderButton(props: Props): JSX.Element {
  const ref = useRef(null)
  const { children, label = 'Place order', disabled, onClick, ...p } = props
  const { isPermitted, setPlaceOrder, options, paymentType, setButtonRef } =
    useContext(PlaceOrderContext)
  const [notPermitted, setNotPermitted] = useState(true)
  const [forceDisable, setForceDisable] = useState(disabled)
  const {
    currentPaymentMethodRef,
    loading,
    currentPaymentMethodType,
    paymentSource,
    setPaymentSource,
    setPaymentMethodErrors
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const isFree = order?.total_amount_with_taxes_cents === 0
  useEffect(() => {
    if (loading) setNotPermitted(loading)
    else {
      if (paymentType === currentPaymentMethodType && paymentType) {
        const card = getCardDetails({
          customerPayment: { payment_source: paymentSource },
          paymentType
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
    paymentSource
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
      options?.adyen?.redirectResult &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status) &&
      paymentSource != null
    ) {
      // @ts-expect-error
      const paymentData = paymentSource?.payment_response?.paymentData
      const attributes = {
        payment_request_details: {
          details: {
            redirectResult: options?.adyen?.redirectResult
          },
          paymentData
        },
        _details: 1
      }
      if (paymentData != null) {
        void setPaymentSource({
          paymentSourceId: paymentSource?.id,
          paymentResource: 'adyen_payments',
          attributes
        }).then((res) => {
          // @ts-expect-error
          const resultCode = res?.payment_response?.resultCode
          // @ts-expect-error
          const errorCode = res?.payment_response?.errorCode
          // @ts-expect-error
          const message = res?.payment_response?.message
          if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
            void handleClick()
          } else if (errorCode != null) {
            setPaymentMethodErrors([
              {
                code: 'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
                resource: 'payment_methods',
                field: currentPaymentMethodType,
                message
              }
            ])
          }
        })
      }
    }
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
  useEffect(() => {
    if (ref?.current != null && setButtonRef != null) {
      setButtonRef(ref)
    }
  }, [ref])

  const handleClick = async (): Promise<void> => {
    let isValid = true
    setForceDisable(true)
    const card =
      paymentType &&
      getCardDetails({
        paymentType,
        customerPayment: { payment_source: paymentSource }
      })
    if (
      currentPaymentMethodRef?.current?.onsubmit &&
      [
        !options?.paypalPayerId,
        !options?.adyen?.MD,
        !options?.checkoutCom?.session_id
      ].every(Boolean)
    ) {
      isValid = (await currentPaymentMethodRef.current?.onsubmit(
        // @ts-expect-error
        paymentSource
      )) as boolean
      if (
        !isValid &&
        // @ts-expect-error
        paymentSource.payment_response?.resultCode === 'Authorised'
      ) {
        isValid = true
      }
    } else if (card?.brand) {
      isValid = true
    }
    const placed =
      isValid &&
      setPlaceOrder &&
      (paymentSource || isFree) &&
      (await setPlaceOrder({ paymentSource }))
    setForceDisable(false)
    onClick && placed && onClick(placed)
  }
  const disabledButton = disabled !== undefined ? disabled : notPermitted
  const parentProps = {
    ...p,
    label,
    disabled: disabledButton,
    handleClick,
    ref
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      ref={ref}
      type='button'
      disabled={disabledButton || forceDisable}
      onClick={() => {
        void handleClick()
      }}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default PlaceOrderButton
