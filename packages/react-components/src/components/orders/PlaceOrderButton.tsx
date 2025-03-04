import {
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type JSX,
} from "react"
import Parent from "../utils/Parent"
import type { ChildrenFunction } from "#typings/index"
import PlaceOrderContext from "#context/PlaceOrderContext"
import isFunction from "lodash/isFunction"
import PaymentMethodContext from "#context/PaymentMethodContext"
import OrderContext from "#context/OrderContext"
import getCardDetails from "#utils/getCardDetails"
import type { BaseError } from "#typings/errors"
import type { Order } from "@commercelayer/sdk"
import { checkPaymentIntent } from "#utils/stripe/retrievePaymentIntent"

interface ChildrenProps extends Omit<Props, "children"> {
  /**
   * Callback function to place the order
   */
  handleClick: () => Promise<void>
}

interface Props
  extends Omit<JSX.IntrinsicElements["button"], "children" | "onClick"> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * The label of the button
   */
  label?: string | ReactNode
  /**
   * The label of the button when it's loading
   */
  loadingLabel?: string | ReactNode
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
    label = "Place order",
    loadingLabel = "Placing...",
    autoPlaceOrder = true,
    disabled,
    onClick,
    ...p
  } = props
  const {
    isPermitted,
    setPlaceOrder,
    options,
    paymentType,
    setButtonRef,
    setPlaceOrderStatus,
    status,
  } = useContext(PlaceOrderContext)
  const [notPermitted, setNotPermitted] = useState(true)
  const [forceDisable, setForceDisable] = useState(disabled)
  const [isLoading, setIsLoading] = useState(false)
  const {
    currentPaymentMethodRef,
    loading,
    currentPaymentMethodType,
    paymentSource,
    setPaymentSource,
    setPaymentMethodErrors,
    currentCustomerPaymentSourceId,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const isFree = order?.total_amount_with_taxes_cents === 0
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to test
  useEffect(() => {
    if (loading) setNotPermitted(loading)
    else {
      if (paymentType === currentPaymentMethodType && paymentType) {
        const card = getCardDetails({
          customerPayment: {
            payment_source: paymentSource,
          },
          paymentType,
        })
        if (
          currentCustomerPaymentSourceId != null &&
          paymentSource?.id === currentCustomerPaymentSourceId &&
          card.brand === ""
        ) {
          // Force creadit card icon for customer payment source imported by API
          card.brand = "credit-card"
        }
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to test
  useEffect(() => {
    // PayPal redirect flow
    if (
      paymentType === "paypal_payments" &&
      options?.paypalPayerId &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      handleClick()
    }
  }, [options?.paypalPayerId, paymentType])
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to test
  useEffect(() => {
    // Stripe redirect flow
    if (
      paymentType === "stripe_payments" &&
      options?.stripe?.paymentIntentClientSecret &&
      // @ts-expect-error no type
      order?.payment_source?.publishable_key &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      // @ts-expect-error no type
      const publicApiKey = order?.payment_source?.publishable_key
      const paymentIntentClientSecret =
        options?.stripe?.paymentIntentClientSecret

      const getPaymentIntent = async (): Promise<void> => {
        const paymentIntentResult = await checkPaymentIntent({
          publicApiKey,
          paymentIntentClientSecret,
        })
        switch (paymentIntentResult.status) {
          case "valid":
            handleClick()
            break
          case "processing":
            // Set a timeout to check the payment intent status again
            setTimeout(() => {
              getPaymentIntent()
            }, 1000)
            break
          case "invalid":
            setPaymentMethodErrors([
              {
                code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
                resource: "payment_methods",
                field: currentPaymentMethodType,
                message: paymentIntentResult.message,
              },
            ])
            break
        }
      }
      getPaymentIntent()
    }
  }, [
    options?.stripe?.paymentIntentClientSecret != null,
    paymentType != null,
    order?.payment_source != null,
  ])
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to test
  useEffect(() => {
    // Adyen redirect flow
    if (order?.status != null && ["draft", "pending"].includes(order?.status)) {
      const resultCode =
        // @ts-expect-error no type
        order?.payment_source?.payment_response?.resultCode === "Authorised"
      const paymentDetails =
        // @ts-expect-error no type
        order?.payment_source?.payment_request_details?.details != null
      if (
        paymentType === "adyen_payments" &&
        options?.adyen?.redirectResult &&
        !paymentDetails
      ) {
        const attributes = {
          payment_request_details: {
            details: {
              redirectResult: options?.adyen?.redirectResult,
            },
          },
          _details: 1,
        }
        setPaymentSource({
          paymentSourceId: paymentSource?.id,
          paymentResource: "adyen_payments",
          attributes,
        }).then((res) => {
          // @ts-expect-error no type
          const resultCode: string = res?.payment_response?.resultCode
          // @ts-expect-error no type
          const errorCode = res?.payment_response?.errorCode
          // @ts-expect-error no type
          const message = res?.payment_response?.message
          if (
            ["Authorised", "Pending", "Received"].includes(resultCode) &&
            autoPlaceOrder
          ) {
            handleClick()
          } else if (errorCode != null) {
            setPaymentMethodErrors([
              {
                code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
                resource: "payment_methods",
                field: currentPaymentMethodType,
                message,
              },
            ])
          }
        })
      } else if (
        paymentType === "adyen_payments" &&
        options?.adyen?.MD &&
        options?.adyen?.PaRes &&
        autoPlaceOrder
      ) {
        handleClick()
      } else if (
        paymentType === "adyen_payments" &&
        resultCode &&
        // @ts-expect-error no type
        ref?.current?.disabled === false &&
        currentCustomerPaymentSourceId == null &&
        autoPlaceOrder &&
        status === "standby"
      ) {
        // NOTE: This is a workaround for the case when the user reloads the page after selecting a customer payment source
        if (
          // @ts-expect-error no type
          order?.payment_source?.payment_response?.merchantReference?.includes(
            order?.number,
          )
        ) {
          handleClick()
        }
      }
    }
  }, [
    options?.adyen,
    paymentType,
    // @ts-expect-error no type
    order?.payment_source?.payment_response?.resultCode,
  ])
  useEffect(() => {
    if (
      order?.status === "placed" &&
      order?.payment_status === "authorized" &&
      paymentType === "adyen_payments"
    ) {
      // Dispatch the onClick callback when the order is placed and the payment status is authorized (Adyen with gift card)
      onClick?.({
        placed: true,
        order: order,
      })
    }
  }, [order, order?.payment_status, order?.status, paymentType, onClick])
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to test
  useEffect(() => {
    // Checkout.com redirect flow
    if (
      paymentType === "checkout_com_payments" &&
      options?.checkoutCom?.session_id &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      handleClick()
    }
  }, [options?.checkoutCom, paymentType])
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to test
  useEffect(() => {
    if (ref?.current != null && setButtonRef != null) {
      setButtonRef(ref)
    }
  }, [ref])
  const handleClick = async (
    e?: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e?.preventDefault()
    e?.stopPropagation()
    setIsLoading(true)
    let isValid = true
    setForceDisable(true)
    const checkPaymentSource =
      paymentType !== "stripe_payments"
        ? await setPaymentSource({
            // @ts-expect-error no type not be undefined
            paymentResource: paymentType,
            paymentSourceId: paymentSource?.id,
          })
        : paymentSource
    const card =
      paymentType &&
      getCardDetails({
        paymentType,
        customerPayment: { payment_source: checkPaymentSource },
      })
    if (
      currentPaymentMethodRef?.current?.onsubmit &&
      [
        !options?.paypalPayerId,
        !options?.adyen?.MD,
        !options?.checkoutCom?.session_id,
      ].every(Boolean)
    ) {
      isValid = (await currentPaymentMethodRef.current?.onsubmit({
        // @ts-expect-error no type
        paymentSource: checkPaymentSource,
        setPlaceOrder,
        onclickCallback: onClick,
      })) as boolean
      if (
        !isValid &&
        // @ts-expect-error no type
        checkPaymentSource?.payment_response?.resultCode === "Authorised"
      ) {
        isValid = true
      }
    } else if (card?.brand) {
      isValid = true
    }
    if (isValid && setPlaceOrderStatus != null) {
      setPlaceOrderStatus({ status: "placing" })
    }
    const placed =
      isValid &&
      setPlaceOrder &&
      (checkPaymentSource || isFree) &&
      (await setPlaceOrder({
        paymentSource: checkPaymentSource,
        currentCustomerPaymentSourceId,
      }))
    if (placed && setPlaceOrderStatus != null) {
      if (placed.placed) {
        setPlaceOrderStatus({ status: "placing" })
        onClick?.(placed)
      } else {
        setForceDisable(false)
        onClick?.(placed)
        setIsLoading(false)
        setPlaceOrderStatus({ status: "standby" })
      }
    } else {
      setForceDisable(false)
      setIsLoading(false)
    }
  }
  const disabledButton = disabled !== undefined ? disabled : notPermitted
  const labelButton = isLoading
    ? loadingLabel
    : isFunction(label)
      ? label()
      : label
  const parentProps = {
    ...p,
    label,
    disabled: disabledButton,
    handleClick,
    parentRef: ref,
    isLoading,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      ref={ref}
      type="button"
      disabled={disabledButton || forceDisable}
      onClick={(e) => {
        handleClick(e)
      }}
      {...p}
    >
      {labelButton}
    </button>
  )
}

export default PlaceOrderButton
