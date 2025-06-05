import { useContext, useEffect, useRef, type JSX } from "react"
import type { PaymentMethodConfig } from "#reducers/PaymentMethodReducer"
import type { PaymentSourceProps } from "./PaymentSource"
import useExternalScript from "#utils/hooks/useExternalScript"
import OrderContext from "#context/OrderContext"
import Parent from "#components/utils/Parent"
import { jwt } from "#utils/jwt"
import CommerceLayerContext from "#context/CommerceLayerContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import { setCustomerOrderParam } from "#utils/localStorage"

const scriptUrl = "https://checkout-web-components.checkout.com/index.js"

interface ElementAppearance {
  fontFamily?: string
  fontSize?: string
  fontWeight?: number
  letterSpacing?: number
  lineHeight?: string
}

interface Appearance {
  colorAction?: string
  colorBackground?: string
  colorBorder?: string
  colorDisabled?: string
  colorError?: string
  colorFormBackground?: string
  colorFormBorder?: string
  colorInverse?: string
  colorOutline?: string
  colorPrimary?: string
  colorSecondary?: string
  colorSuccess?: string
  borderRadius?: [string, string]
  button?: ElementAppearance
  footnote?: ElementAppearance
  label?: ElementAppearance
  input?: ElementAppearance
  subheading?: ElementAppearance
}

interface Component {
  isValid: () => boolean
  type: string
  submit: () => unknown
  tokenize: () => Promise<{
    data: {
      token: string
    }
  }>
}

interface CheckoutWebComponent {
  appearance?: Partial<Appearance>
  showPayButton?: boolean
  publicKey: string
  environment: "sandbox" | "production"
  locale?: string
  paymentSession: string
  onReady?: () => void
  submit?: () => unknown
  onPaymentCompleted?: (
    component: Component,
    paymentResponse: {
      status: string
      id: string
      type: string
    },
  ) => Promise<void>
  onChange?: (component: Component) => void
  onError?: (component: Component, error: unknown) => void
  create?: (type: "flow") => {
    mount: (element: HTMLElement | null) => void
  }
  componentOptions?: {
    card?: {
      displayCardholderName?: "hidden" | "top" | "bottom"
    }
  }
}

export interface CheckoutComConfig {
  containerClassName?: string
  hintLabel?: string
  name?: string
  success_url: string
  failure_url: string
  options?: {
    appearance: Appearance
  }
  [key: string]: unknown
}

type Props = Partial<PaymentMethodConfig["checkoutComPayment"]> &
  JSX.IntrinsicElements["div"] & {
    show?: boolean
    publicKey: string
    locale?: string
    templateCustomerSaveToWallet?: PaymentSourceProps["templateCustomerSaveToWallet"]
  }

export function CheckoutComPayment({
  publicKey,
  options,
  ...p
}: Props): JSX.Element | null {
  const ref = useRef<null | HTMLFormElement>(null)
  const loaded = useExternalScript(scriptUrl)
  const { setPaymentRef, setPaymentSource } = useContext(PaymentMethodContext)
  const { accessToken } = useContext(CommerceLayerContext)
  const { order } = useContext(OrderContext)
  // const { setPlaceOrder } = useContext(PlaceOrderContext)
  const {
    containerClassName,
    templateCustomerSaveToWallet,
    successUrl = window.location.href,
    failureUrl = window.location.href,
    show,
    ...divProps
  } = p
  // biome-ignore lint/correctness/useExhaustiveDependencies: Infinite loop
  useEffect(() => {
    const ps = order?.payment_source
    if (loaded && window && ps && accessToken) {
      // @ts-expect-error no type
      const publicKey = ps.public_key
      // @ts-expect-error no type
      const paymentSession = ps.payment_session
      // @ts-expect-error no type
      if (window?.CheckoutWebComponents) {
        const environment = jwt(accessToken).test ? "sandbox" : "production"
        const locale = order?.language_code ?? "en"
        const loadFlow = async () => {
          // @ts-expect-error no type
          const checkout = await window.CheckoutWebComponents({
            appearance: {
              ...options?.appearance,
            },
            showPayButton: false,
            publicKey,
            environment,
            locale,
            paymentSession,
            componentOptions: {
              card: {
                displayCardholderName: "hidden",
              },
            },
            onChange: (component) => {
              if (component.isValid()) {
                if (ref.current) {
                  ref.current.onsubmit = async (): Promise<boolean> => {
                    const element = ref.current?.elements
                    const savePaymentSourceToCustomerWallet =
                      // @ts-expect-error no type
                      element?.save_payment_source_to_customer_wallet?.checked
                    if (savePaymentSourceToCustomerWallet)
                      setCustomerOrderParam(
                        "_save_payment_source_to_customer_wallet",
                        savePaymentSourceToCustomerWallet,
                      )
                    const { data } = await component.tokenize()
                    const token = data?.token
                    const paymentSource = await setPaymentSource({
                      paymentSourceId: ps.id,
                      paymentResource: "checkout_com_payments",
                      attributes: {
                        token,
                        _authorize: true,
                      },
                    })
                    if (paymentSource) {
                      // @ts-expect-error no type
                      const response = paymentSource.payment_response
                      // @ts-expect-error no type
                      const securityRedirect = paymentSource?.redirect_uri
                      const isStatusPending =
                        response?.status.toLowerCase() === "pending"
                      if (isStatusPending && securityRedirect) {
                        window.location.href = securityRedirect
                        return false
                      }
                      return true
                    }
                    return false
                  }
                  setPaymentRef?.({ ref })
                }
              }
            },
            onError: (component, error) => {
              console.error("onError", { error }, "Component", component.type)
            },
            // onPaymentCompleted: async (component, paymentResponse) => {
            //   console.log("onPaymentCompleted -----", {
            //     paymentResponse,
            //     component,
            //     ps,
            //   })
            //   const paymentSource = await setPaymentSource({
            //     paymentSourceId: ps.id,
            //     paymentResource: "checkout_com_payments",
            //     attributes: {
            //       token: paymentResponse.id,
            //       _authorize: true,
            //     },
            //   })
            //   console.log("paymentSource", { paymentSource })
            // },
          } satisfies CheckoutWebComponent)
          const flowComponent = checkout.create("flow")
          // const flowComponent = checkout.create("card")
          // if (await flowComponent.isAvailable()) {
          //   flowComponent.mount(document.getElementById("flow-container"))
          // }
          flowComponent.mount(document.getElementById("flow-container"))
        }
        loadFlow()
      }
    }
  }, [loaded, order?.payment_source?.id, accessToken])
  return loaded && show ? (
    <form ref={ref}>
      <div className={containerClassName} {...divProps}>
        <div id="flow-container" />
      </div>
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: "save_payment_source_to_customer_wallet" }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  ) : null
}

export default CheckoutComPayment
