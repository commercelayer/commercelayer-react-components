import { useContext, useEffect, useRef, useState, type JSX } from "react"
import PaymentMethodContext from "#context/PaymentMethodContext"
import type { PaymentMethodConfig } from "#reducers/PaymentMethodReducer"
import type { PaymentSourceProps } from "./PaymentSource"
import OrderContext from "#context/OrderContext"
import useExternalScript from "#utils/hooks/useExternalScript"
import type { LineItem } from "@commercelayer/sdk"
// import PlaceOrderContext from '#context/PlaceOrderContext'
// import { tr } from '@faker-js/faker'

interface KlarnaResponse {
  show_form: boolean
  approved: boolean
  authorization_token?: string
  Error?: { invalid_fields: string[] }
}

type KlarnaPaymentProps = PaymentMethodConfig["klarnaPayment"] &
  JSX.IntrinsicElements["div"] &
  Partial<PaymentSourceProps["templateCustomerSaveToWallet"]> & {
    show?: boolean
    clientToken: string
    locale?: string | null
  }

function typeOfLine(
  lineItemType: string | null | undefined,
): OrderLine["type"] {
  switch (lineItemType) {
    case "percentage_discount_promotions":
      return "discount"
    case "shipments":
      return "shipping_fee"
    case "skus":
      return "physical"
    case "payment_methods":
    default:
      return null
  }
}

type OrderLine = Partial<{
  name: string
  quantity: number
  total_amount: number
  unit_price: number
  type: "discount" | "physical" | "shipping_fee" | null
}>

function klarnaOrderLines(lineItems?: LineItem[] | null): OrderLine[] {
  return lineItems
    ? // @ts-expect-error no type
      lineItems?.map((item) => {
        const type = item.item_type ? typeOfLine(item.item_type) : null
        return {
          // name: item.name,
          quantity: item.quantity,
          total_amount: item.total_amount_cents,
          unit_price: item.unit_amount_cents,
          type,
        }
      })
    : []
}

export default function KlarnaPayment({
  clientToken,
  placeOrderCallback,
  locale = "EN",
  ...p
}: KlarnaPaymentProps): JSX.Element | null {
  const ref = useRef<null | HTMLFormElement>(null)
  const {
    paymentSource,
    currentPaymentMethodType,
    setPaymentRef,
    setPaymentSource,
  } = useContext(PaymentMethodContext)
  const { order } = useContext(OrderContext)
  const loaded = useExternalScript("https://x.klarnacdn.net/kp/lib/v1/api.js")
  const [klarna, setKlarna] = useState<any>()
  const { containerClassName, ...divProps } = p
  useEffect(() => {
    if (loaded && window?.Klarna !== undefined) {
      setKlarna(window.Klarna)
    }
  }, [loaded, window.Klarna])
  useEffect(() => {
    if (
      ref.current &&
      paymentSource &&
      currentPaymentMethodType &&
      loaded &&
      klarna
    ) {
      ref.current.onsubmit = async (props: any) => {
        handleClick(klarna, props)
      }
      setPaymentRef({ ref })
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
    }
  }, [ref, paymentSource, currentPaymentMethodType, loaded, klarna])
  const handleClick = (kl: any, props: any): void => {
    // @ts-expect-error no type
    const [first] = paymentSource?.payment_methods || undefined
    const paymentMethodCategories = first?.identifier
    const billingAddress = {
      given_name: order?.billing_address?.first_name,
      family_name: order?.billing_address?.last_name,
      email: order?.customer_email,
      street_address: order?.billing_address?.line_1,
      street_address2: null,
      organization_name: null,
      postal_code: order?.billing_address?.zip_code,
      city: order?.billing_address?.city,
      region: order?.billing_address?.state_code,
      phone: order?.billing_address?.phone,
      country: order?.billing_address?.country_code,
    }
    const shippingAddress = {
      given_name: order?.shipping_address?.first_name,
      family_name: order?.shipping_address?.last_name,
      email: order?.customer_email,
      street_address: order?.shipping_address?.line_1,
      street_address2: null,
      postal_code: order?.shipping_address?.zip_code,
      organization_name: null,
      city: order?.shipping_address?.city,
      region: order?.shipping_address?.state_code,
      phone: order?.shipping_address?.phone,
      country: order?.shipping_address?.country_code,
    }
    const klarnaData = {
      merchant_data: order?.id,
      purchase_country: order?.country_code,
      purchase_currency: order?.currency_code,
      locale,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      order_amount: order?.total_amount_cents,
      order_lines: klarnaOrderLines(order?.line_items),
      order_tax_amount: order?.total_tax_amount_cents,
    }
    kl.Payments.authorize(
      {
        payment_method_category: paymentMethodCategories,
        ...klarnaData,
      },
      async (res: KlarnaResponse) => {
        if (res.approved && paymentSource && currentPaymentMethodType) {
          const ps = await setPaymentSource({
            paymentSourceId: paymentSource.id,
            paymentResource: currentPaymentMethodType,
            attributes: {
              auth_token: res.authorization_token,
            },
          })
          if (props.setPlaceOrder != null) {
            const placed = await props.setPlaceOrder({ paymentSource: ps })
            if (placed && props.onclickCallback != null) {
              props.onclickCallback(placed)
            }
          }
        }
      },
    )
  }
  if (klarna && clientToken) {
    // @ts-expect-error no type
    const [first] = paymentSource?.payment_methods || undefined
    klarna.Payments.init({
      client_token: clientToken,
    })
    klarna.Payments.load({
      container: "#klarna-payments-container",
      payment_method_category: first?.identifier,
    })
  }
  return (
    <form ref={ref}>
      <div className={containerClassName} {...divProps}>
        <div id="klarna-payments-container" />
      </div>
    </form>
  )
}
