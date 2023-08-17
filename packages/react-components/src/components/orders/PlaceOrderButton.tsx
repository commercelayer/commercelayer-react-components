import {
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent
} from 'react'
import Parent from '../utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import PlaceOrderContext from '#context/PlaceOrderContext'
import isFunction from 'lodash/isFunction'
import PaymentMethodContext from '#context/PaymentMethodContext'
import OrderContext from '#context/OrderContext'
import getCardDetails from '#utils/getCardDetails'
import type { BaseError } from '#typings/errors'
import type { Order } from '@commercelayer/sdk'

interface ChildrenProps extends Omit<Props, 'children'> {
  /**
   * Callback function to place the order
   */
  handleClick: () => Promise<void>
}

interface Props
  extends Omit<JSX.IntrinsicElements['button'], 'children' | 'onClick'> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * The label of the button
   */
  label?: string | ReactNode
  /**
   * If false, the button doesn't place the order automatically. Default: true
   */
  autoPlaceOrder?: boolean
  /**
   * Callback function that is fired when the button is clicked
   */
  onClick?: (response: {
    placed: boolean
    order?: Order
    errors?: BaseError[]
  }) => void
}

export function PlaceOrderButton(props: Props): JSX.Element {
  const ref = useRef(null)
  const {
    children,
    label = 'Place order',
    autoPlaceOrder = true,
    disabled,
    onClick,
    ...p
  } = props
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
      ['draft', 'pending'].includes(order?.status) &&
      autoPlaceOrder
    ) {
      void handleClick()
    }
  }, [options?.paypalPayerId, paymentType])
  useEffect(() => {
    if (
      paymentType === 'stripe_payments' &&
      ['succeeded', 'pending'].includes(
        options?.stripe?.redirectStatus ?? ''
      ) &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status) &&
      autoPlaceOrder
    ) {
      void handleClick()
    }
  }, [options?.stripe?.redirectStatus, paymentType])
  useEffect(() => {
    if (order?.status != null && ['draft', 'pending'].includes(order?.status)) {
      if (
        paymentType === 'adyen_payments' &&
        options?.adyen?.redirectResult &&
        paymentSource != null
      ) {
        const attributes = {
          payment_request_details: {
            details: {
              redirectResult: options?.adyen?.redirectResult
            }
          },
          _details: 1
        }
        void setPaymentSource({
          paymentSourceId: paymentSource?.id,
          paymentResource: 'adyen_payments',
          attributes
        }).then((res) => {
          // @ts-expect-error no type
          const resultCode = res?.payment_response?.resultCode
          // @ts-expect-error no type
          const errorCode = res?.payment_response?.errorCode
          // @ts-expect-error no type
          const message = res?.payment_response?.message
          if (
            ['Authorised', 'Pending', 'Received'].includes(resultCode) &&
            autoPlaceOrder
          ) {
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
      } else if (
        paymentType === 'adyen_payments' &&
        options?.adyen?.MD &&
        options?.adyen?.PaRes &&
        autoPlaceOrder
      ) {
        void handleClick()
      } else if (
        paymentType === 'adyen_payments' &&
        // @ts-expect-error no type
        order?.payment_source?.payment_response?.resultCode === 'Authorised' &&
        // @ts-expect-error no type
        ref?.current?.disabled === false &&
        autoPlaceOrder
      ) {
        void handleClick()
      }
    }
  }, [
    options?.adyen,
    paymentType,
    // @ts-expect-error no type
    order?.payment_source?.payment_response?.resultCode
  ])
  useEffect(() => {
    if (
      paymentType === 'checkout_com_payments' &&
      options?.checkoutCom?.session_id &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status) &&
      autoPlaceOrder
    ) {
      void handleClick()
    }
  }, [options?.checkoutCom, paymentType])
  useEffect(() => {
    if (ref?.current != null && setButtonRef != null) {
      setButtonRef(ref)
    }
  }, [ref])

  const handleClick = async (
    e?: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e?.preventDefault()
    e?.stopPropagation()
    let isValid = true
    setForceDisable(true)
    const checkPaymentSource = await setPaymentSource({
      // @ts-expect-error no type not be undefined
      paymentResource: paymentType,
      paymentSourceId: paymentSource?.id
    })
    const card =
      paymentType &&
      getCardDetails({
        paymentType,
        customerPayment: { payment_source: checkPaymentSource }
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
        // @ts-expect-error no type
        checkPaymentSource
      )) as boolean
      if (
        !isValid &&
        // @ts-expect-error no type
        checkPaymentSource.payment_response?.resultCode === 'Authorised'
      ) {
        isValid = true
      }
    } else if (card?.brand) {
      isValid = true
    }
    const placed =
      isValid &&
      setPlaceOrder &&
      (checkPaymentSource || isFree) &&
      (await setPlaceOrder({ paymentSource: checkPaymentSource }))
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
      onClick={(e) => {
        void handleClick(e)
      }}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default PlaceOrderButton
