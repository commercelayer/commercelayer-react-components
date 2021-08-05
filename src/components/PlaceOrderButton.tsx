import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import PlaceOrderContext from '#context/PlaceOrderContext'
import isFunction from 'lodash/isFunction'
import PaymentMethodContext from '#context/PaymentMethodContext'

const propTypes = components.PlaceOrderButton.propTypes
const defaultProps = components.PlaceOrderButton.defaultProps
const displayName = components.PlaceOrderButton.displayName

type PlaceOrderButtonChildrenProps = FunctionChildren<
  Omit<PlaceOrderButtonProps, 'children'>
>

type PlaceOrderButtonProps = {
  children?: PlaceOrderButtonChildrenProps
  label?: string | ReactNode
  onClick?: (response: { placed: boolean }) => void
} & JSX.IntrinsicElements['button']

const PlaceOrderButton: FunctionComponent<PlaceOrderButtonProps> = (props) => {
  const { children, label = 'Place order', disabled, onClick, ...p } = props
  const { isPermitted, setPlaceOrder, options, paymentType } =
    useContext(PlaceOrderContext)
  const [notPermitted, setNotPermitted] = useState(true)
  const [forceDisable, setForceDisable] = useState(disabled)
  const {
    currentPaymentMethodRef,
    paymentSource,
    loading,
    currentPaymentMethodType,
  } = useContext(PaymentMethodContext)
  useEffect(() => {
    if (loading) setNotPermitted(loading)
    else {
      if (paymentType === currentPaymentMethodType) {
        if (
          (currentPaymentMethodRef?.current?.onsubmit ||
            // @ts-ignore
            paymentSource?.metadata?.card?.id ||
            // @ts-ignore
            paymentSource?.options?.id) &&
          isPermitted
        ) {
          setNotPermitted(false)
        }
      } else {
        setNotPermitted(true)
      }
    }
    if (paymentType === 'paypal_payments' && options?.paypalPayerId) {
      handleClick()
    }
    return () => {
      setNotPermitted(true)
    }
  }, [
    isPermitted,
    options?.paypalPayerId,
    paymentType,
    currentPaymentMethodRef?.current?.onsubmit,
    paymentSource,
    loading,
    currentPaymentMethodType,
  ])
  const handleClick = async () => {
    let isValid = true
    setForceDisable(true)
    if (currentPaymentMethodRef?.current?.onsubmit && !options?.paypalPayerId) {
      // @ts-ignore
      isValid = (await currentPaymentMethodRef.current?.onsubmit()) as any
      // @ts-ignore
    } else if (paymentSource?.options?.id) {
      isValid = true
    }
    const placed =
      isValid &&
      setPlaceOrder &&
      (await setPlaceOrder({ paymentSource: paymentSource as any }))
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
