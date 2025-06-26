import type { Order } from "@commercelayer/sdk"
import isFunction from "lodash/isFunction"
import {
  type JSX,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import OrderContext from "#context/OrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import useCommerceLayer from "#hooks/useCommerceLayer"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import getCardDetails from "#utils/getCardDetails"
import { checkPaymentIntent } from "#utils/stripe/retrievePaymentIntent"
import Parent from "../utils/Parent"

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
  const { sdkClient } = useCommerceLayer()
  const {
    currentPaymentMethodRef,
    loading,
    currentPaymentMethodType,
    paymentSource,
    setPaymentSource,
    setPaymentMethodErrors,
    currentCustomerPaymentSourceId,
  } = useContext(PaymentMethodContext)
  const { order, setOrderErrors } = useContext(OrderContext)
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
  useEffect(() => {
    // Checkout.com redirect flow
    if (
      paymentType === "checkout_com_payments" &&
      options?.checkoutCom?.session_id &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      // @ts-expect-error no type
      const paymentResponse = order?.payment_source?.payment_response
      const paymentStatus = paymentResponse?.status
      if (paymentStatus && paymentStatus.toLowerCase() === "pending") {
        setPaymentSource({
          paymentSourceId: paymentSource?.id,
          paymentResource: "checkout_com_payments",
          attributes: {
            _details: 1,
          },
        }).then((res) => {
          // @ts-expect-error no type
          const paymentStatus: string = res?.payment_response?.status
          if (paymentStatus && paymentStatus.toLowerCase() === "authorized") {
            handleClick()
          } else {
            if (options?.checkoutCom) {
              options.checkoutCom.session_id = undefined
            }
            setPaymentMethodErrors([
              {
                code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
                resource: "payment_methods",
                field: currentPaymentMethodType,
                message: paymentStatus,
              },
            ])
          }
        })
      }
    }
    if (
      paymentType === "checkout_com_payments" &&
      order?.status &&
      status &&
      ["pending"].includes(order?.status) &&
      ["placing"].includes(status) &&
      autoPlaceOrder
    ) {
      /**
       * Place order with Checkout.com using express payments
       */
      const paymentSourceStatus =
        // @ts-expect-error no type
        order?.payment_source?.payment_response?.status
      if (
        paymentSourceStatus &&
        ["captured", "authorized"].includes(paymentSourceStatus.toLowerCase())
      ) {
        setPlaceOrder?.({
          paymentSource,
        }).then((placed) => {
          if (placed?.placed) {
            onClick?.(placed)
            setPlaceOrderStatus?.({ status: "placing" })
          } else {
            setPlaceOrderStatus?.({ status: "standby" })
          }
        })
      }
    }
  }, [options?.checkoutCom, paymentType, order?.payment_source?.id, status])
  useEffect(() => {
    if (ref?.current != null && setButtonRef != null) {
      setButtonRef(ref)
    }
  }, [ref])
  useEffect(() => {
    switch (status) {
      case "disabled":
      case "placing":
        setNotPermitted(true)
        break
      default:
        setNotPermitted(false)
        break
    }
  }, [status])
  const handleClick = async (
    e?: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e?.preventDefault()
    e?.stopPropagation()
    const sdk = sdkClient()
    if (sdk == null) return
    if (order == null) return

    const isStripePayment = paymentType === "stripe_payments"
    if (!isStripePayment) {
      /**
       * Check if the order is already placed or in draft status to avoid placing it again
       * and to prevent placing a draft order
       * @see https://docs.commercelayer.io/core/how-tos/placing-orders/checkout/placing-the-order
       */
      const { status } = await sdk.orders.retrieve(order?.id, {
        fields: ["status"],
      })
      const isAlreadyPlaced = status === "placed"
      const isDraftOrder = status === "draft"
      if (isAlreadyPlaced) {
        /**
         * Order already placed
         */
        setPlaceOrderStatus?.({ status: "placing" })
        onClick?.({
          placed: true,
          order: order,
        })
        return
      }
      if (isDraftOrder) {
        /**
         * Draft order cannot be placed
         */
        setPlaceOrderStatus?.({ status: "standby" })
        onClick?.({
          placed: false,
          order: order,
          errors: [
            {
              code: "VALIDATION_ERROR",
              resource: "orders",
              message: "Draft order cannot be placed",
            },
          ],
        })
        setOrderErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "orders",
            message: "Draft order cannot be placed",
          },
        ])
        return
      }
    }
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
    } else if (
      currentPaymentMethodRef?.current?.onsubmit &&
      options?.checkoutCom?.session_id &&
      // @ts-expect-error no type
      checkPaymentSource?.payment_response?.status &&
      // @ts-expect-error no type
      checkPaymentSource?.payment_response?.status?.toLowerCase() === "declined"
    ) {
      /**
       * Permit to place order with declined payment using Checkout.com
       */
      isValid = (await currentPaymentMethodRef.current?.onsubmit({
        // @ts-expect-error no type
        paymentSource: checkPaymentSource,
        setPlaceOrder,
        onclickCallback: onClick,
      })) as boolean
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
