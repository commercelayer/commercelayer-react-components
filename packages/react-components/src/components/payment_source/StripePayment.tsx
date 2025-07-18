import { Elements, PaymentElement, useElements } from "@stripe/react-stripe-js"
import type {
  Stripe,
  StripeConstructorOptions,
  StripeElementLocale,
  StripeElements,
  StripeElementsOptions,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from "@stripe/stripe-js"
import { type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import useCommerceLayer from "#hooks/useCommerceLayer"
import type { PaymentMethodConfig } from "#reducers/PaymentMethodReducer"
import { setCustomerOrderParam } from "#utils/localStorage"
import type { PaymentSourceProps } from "./PaymentSource"
import { StripeExpressPayment } from "./StripeExpressPayment"

export interface StripeConfig {
  containerClassName?: string
  hintLabel?: string
  name?: string
  options?: StripePaymentElementOptions
  appearance?: StripeElementsOptions["appearance"]
  // biome-ignore lint/suspicious/noExplicitAny: No type available
  [key: string]: any
}

interface StripePaymentFormProps {
  options?: StripePaymentElementOptions
  templateCustomerSaveToWallet?: PaymentSourceProps["templateCustomerSaveToWallet"]
  stripe?: Stripe | null
}

interface OnSubmitArgs {
  event: HTMLFormElement | null
  stripe: Stripe | null
  elements: StripeElements | null
}

const defaultOptions: StripePaymentElementOptions = {
  layout: {
    type: "accordion",
    defaultCollapsed: false,
    radios: true,
    spacedAccordionItems: false,
  },
  fields: { billingDetails: "never" },
}

const defaultAppearance: StripeElementsOptions["appearance"] = {
  theme: "stripe",
  variables: {
    colorText: "#32325d",
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  },
}

let selectedPaymentMethodType: string | null = null

function StripePaymentForm({
  options = defaultOptions,
  templateCustomerSaveToWallet,
  stripe,
}: StripePaymentFormProps): JSX.Element {
  const ref = useRef<null | HTMLFormElement>(null)
  const { currentPaymentMethodType, setPaymentMethodErrors, setPaymentRef } =
    useContext(PaymentMethodContext)
  const { order, setOrderErrors } = useContext(OrderContext)
  const { sdkClient } = useCommerceLayer()
  const { setPlaceOrderStatus } = useContext(PlaceOrderContext)
  const elements = useElements()
  useEffect(() => {
    if (ref.current && stripe && elements) {
      ref.current.onsubmit = async () => {
        return await onSubmit({
          event: ref.current,
          stripe,
          elements,
        })
      }
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, stripe, elements])
  const onSubmit = async ({
    event,
    stripe,
    elements,
  }: OnSubmitArgs): Promise<boolean> => {
    if (!stripe) return false
    const sdk = sdkClient()
    if (sdk == null) return false
    if (order == null) return false
    if (
      selectedPaymentMethodType &&
      !["apple_pay", "google_pay"].includes(selectedPaymentMethodType)
    ) {
      const { status } = await sdk.orders.retrieve(order?.id, {
        fields: ["status"],
      })
      const isDraftOrder = status === "draft"
      if (isDraftOrder) {
        /**
         * Draft order cannot be placed
         */
        setOrderErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "orders",
            message: "Draft order cannot be placed",
          },
        ])
        setPlaceOrderStatus?.({
          status: "disabled",
        })
        return false
      }
    }
    const savePaymentSourceToCustomerWallet: string =
      // @ts-expect-error no type
      event?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        "_save_payment_source_to_customer_wallet",
        savePaymentSourceToCustomerWallet,
      )
    if (elements != null) {
      const billingInfo = order?.billing_address
      const email = order?.customer_email ?? ""
      const billingDetails = {
        name: billingInfo?.full_name ?? "",
        email,
        phone: billingInfo?.phone,
        address: {
          city: billingInfo?.city,
          country: billingInfo?.country_code,
          line1: billingInfo?.line_1,
          line2: billingInfo?.line_2 ?? "",
          postal_code: billingInfo?.zip_code ?? "",
          state: billingInfo?.state_code,
        },
      }
      const url = new URL(window.location.href)
      const cleanUrl = `${url.origin}${url.pathname}?accessToken=${url.searchParams.get("accessToken")}`
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: cleanUrl,
          payment_method_data: {
            billing_details: billingDetails,
          },
        },
        redirect: "if_required",
      })
      if (error) {
        console.error(error)
        setPaymentMethodErrors([
          {
            code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
            resource: "payment_methods",
            field: currentPaymentMethodType,
            message: error.message ?? "",
          },
        ])
        return false
      }
      return true
    }
    return false
  }

  async function handleChange(event: StripePaymentElementChangeEvent) {
    console.debug("StripePaymentElement onChange event", { event })
    selectedPaymentMethodType = event.value.type
    // Handle change events from the PaymentElement
    if (
      event.complete &&
      ["apple_pay", "google_pay"].includes(event.value.type)
    ) {
      const sdk = sdkClient()
      if (sdk == null) return
      if (order == null) return
      const { status } = await sdk.orders.retrieve(order?.id, {
        fields: ["status"],
      })
      const isDraftOrder = status === "draft"
      if (isDraftOrder) {
        /**
         * Draft order cannot be placed
         */
        setOrderErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "orders",
            message: "Draft order cannot be placed",
          },
        ])
        setPlaceOrderStatus?.({
          status: "disabled",
        })
        return
      }
    }
  }

  return (
    <form ref={ref}>
      {/* <CardElement options={{ ...defaultOptions, ...options }} /> */}
      <PaymentElement
        id="payment-element"
        options={{ ...defaultOptions, ...options }}
        onChange={handleChange}
      />
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: "save_payment_source_to_customer_wallet" }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  )
}

type Props = PaymentMethodConfig["stripePayment"] &
  Omit<JSX.IntrinsicElements["div"], "ref"> &
  Partial<PaymentSourceProps["templateCustomerSaveToWallet"]> & {
    show?: boolean
    publishableKey: string
    locale?: StripeElementLocale
    clientSecret: string
    expressPayments?: boolean
    connectedAccount?: string
  }

export function StripePayment({
  publishableKey,
  show,
  options,
  clientSecret,
  locale = "auto",
  expressPayments = false,
  connectedAccount,
  ...p
}: Props): JSX.Element | null {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    fonts = [],
    appearance,
    ...divProps
  } = p
  useEffect(() => {
    if (show && publishableKey) {
      import("@stripe/stripe-js").then(({ loadStripe }) => {
        const getStripe = async (): Promise<void> => {
          const options = {
            locale,
            ...(connectedAccount ? { stripeAccount: connectedAccount } : {}),
          } satisfies StripeConstructorOptions
          const res = await loadStripe(publishableKey, options)
          if (res != null) {
            setStripe(res)
            setIsLoaded(true)
          } else {
            console.error("Stripe failed to load")
            setIsLoaded(false)
          }
        }
        getStripe()
      })
    }
    return () => {
      setIsLoaded(false)
    }
  }, [show, publishableKey, connectedAccount])
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: { ...defaultAppearance, ...appearance },
    fonts,
  }
  return isLoaded && stripe != null && clientSecret != null ? (
    <div className={containerClassName} {...divProps}>
      <Elements stripe={stripe} options={elementsOptions}>
        {expressPayments ? (
          <StripeExpressPayment clientSecret={clientSecret} />
        ) : (
          <StripePaymentForm
            stripe={stripe}
            options={options}
            templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          />
        )}
      </Elements>
    </div>
  ) : null
}

export default StripePayment
