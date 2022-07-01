import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
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

const PlaceOrderButton: FunctionComponent<PlaceOrderButtonProps> = (props) => {
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
      options?.adyen?.redirectResult &&
      order?.status &&
      ['draft', 'pending'].includes(order?.status)
    ) {
      const attributes = {
        payment_request_details: {
          details: {
            redirectResult: options?.adyen?.redirectResult,
          },
          // @ts-ignore
          paymentData: paymentSource.payment_response.paymentData,
        },
        _details: 1,
      }
      setPaymentSource({
        paymentSourceId: paymentSource?.id,
        paymentResource: 'adyen_payments',
        attributes,
      }).then((res) => {
        // @ts-ignore
        const resultCode = res?.payment_response?.resultCode
        if (['Authorised', 'Pending', 'Received'].includes(resultCode)) {
          handleClick()
        }
      })
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
    if (ref != null && ref.current != null && setButtonRef != null) {
      setButtonRef(ref)
    }
  }, [ref])
  
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
      isValid = (await currentPaymentMethodRef.current?.onsubmit(paymentSource)) as boolean
      // @ts-ignore
      if (isValid === false && paymentSource.payment_response?.resultCode === 'Authorised') {
        isValid = true
      } 
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
    ref
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
      <button
        ref={ref}
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
