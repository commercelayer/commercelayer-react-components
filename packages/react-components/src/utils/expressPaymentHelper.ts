import type { CommerceLayerConfig } from "#context/CommerceLayerContext"
import type {
  OrderUpdate,
  Order,
  PaymentMethod,
  QueryParamsRetrieve,
  AddressCreate,
} from "@commercelayer/sdk"
import getSdk from "./getSdk"
import type { PaymentRequestShippingOption } from "@stripe/stripe-js"
import type { PaymentResource } from "#reducers/PaymentMethodReducer"
import { getDomain } from "./getDomain"
import { getOrganizationConfig } from "./organization"
import { getApplicationLink } from "./getApplicationLink"

const availablePaymentMethods = ["stripe_payments"]

export function getAvailableExpressPayments(
  paymentMethods: PaymentMethod[],
): PaymentMethod[] {
  return paymentMethods.filter((payment) => {
    if (!payment.payment_source_type) return false
    return availablePaymentMethods.includes(payment.payment_source_type)
  })
}

interface TFakeAddressParams {
  /**
   * The order id
   */
  orderId: string
  /**
   * The Commerce Layer config
   */
  config: Required<CommerceLayerConfig>
  /**
   * The address resource
   */
  address: AddressCreate
  /**
   * The customer email
   */
  email?: string
}

export async function setExpressFakeAddress({
  orderId,
  config,
  address,
  email,
}: TFakeAddressParams): Promise<Order> {
  const params: QueryParamsRetrieve = {
    include: ["shipments.available_shipping_methods"],
  }
  const sdk = getSdk(config)
  const fakeAddress = await sdk.addresses.create(address)
  const resource: OrderUpdate = {
    id: orderId,
    billing_address: sdk.addresses.relationship(fakeAddress.id),
    _shipping_address_same_as_billing: true,
  }
  if (email != null) resource.customer_email = email
  await sdk.orders.update(resource, params)
  return await sdk.orders.retrieve(orderId, params)
}

export function getExpressShippingMethods(
  order: Order,
): PaymentRequestShippingOption[] | null {
  const isSingleShipment = order?.shipments?.length === 1
  const shippingMethods = order?.shipments?.map(
    (shipment) => shipment.available_shipping_methods,
  )
  if (isSingleShipment) {
    if (shippingMethods == null) return null
    return shippingMethods.flat().map((method) => {
      const shippingOption: PaymentRequestShippingOption = {
        id: method?.id ?? "",
        label: method?.name ?? "",
        amount: method?.price_amount_for_shipment_cents ?? 0,
        detail: "",
      }
      return shippingOption
    })
  }
  if (shippingMethods == null) return null
  const shippingOptionsAmount: number[] = []
  // biome-ignore lint/complexity/noForEach: Need to refactor
  shippingMethods.forEach((methods) => {
    if (methods != null) {
      const [firstMethod] = methods
      if (firstMethod != null) {
        shippingOptionsAmount.push(
          firstMethod.price_amount_for_shipment_cents ?? 0,
        )
      }
    }
  })
  const shippingOptions: PaymentRequestShippingOption[] = [
    {
      id: "shipping",
      label: "Shipping",
      amount: shippingOptionsAmount.reduce((a, b) => a + b, 0),
      detail: "",
    },
  ]
  return shippingOptions
}

type TSetExpressShippingMethodParams = {
  /**
   * The Commerce Layer config
   */
  config: CommerceLayerConfig
  /**
   * The order id
   */
  orderId: string
  /**
   * The query params
   */
  params?: QueryParamsRetrieve
} & (
  | {
      /**
       * Select the first shipping method
       */
      selectFirst: false
      /**
       * The selected shipping method id
       */
      selectedShippingMethodId?: string
    }
  | {
      selectFirst?: true
      selectedShippingMethodId?: never
    }
)

export async function setExpressShippingMethod({
  config,
  orderId,
  selectFirst = true,
  selectedShippingMethodId,
  params,
}: TSetExpressShippingMethodParams): Promise<Order> {
  const sdk = getSdk(config)
  const order = await sdk.orders.retrieve(orderId, params)
  const shippingMethods = getExpressShippingMethods(order)
  if (order?.shipments == null) throw new Error("No shipments found")
  const isSingleShipment = order.shipments.length === 1
  const [shipmentId] = order.shipments.map((shipment) => shipment.id)
  if (shipmentId == null) throw new Error("No shipment found")
  if (shippingMethods == null || shippingMethods?.length === 0)
    throw new Error("No shipping methods found")
  if (isSingleShipment) {
    if (selectFirst) {
      const [firstShippingMethodId] = shippingMethods.map((method) => method.id)
      if (firstShippingMethodId != null) {
        await sdk.shipments.update({
          id: shipmentId,
          shipping_method: sdk.shipping_methods.relationship(
            firstShippingMethodId,
          ),
        })
      }
    } else {
      if (selectedShippingMethodId != null) {
        await sdk.shipments.update({
          id: shipmentId,
          shipping_method: sdk.shipping_methods.relationship(
            selectedShippingMethodId,
          ),
        })
      }
    }
  } else {
    for (const shipment of order?.shipments ?? []) {
      const [firstShippingMethodId] =
        shipment?.available_shipping_methods?.map((method) => method.id) ?? []
      if (firstShippingMethodId != null) {
        await sdk.shipments.update({
          id: shipment.id,
          shipping_method: sdk.shipping_methods.relationship(
            firstShippingMethodId,
          ),
        })
      }
    }
  }
  return await sdk.orders.retrieve(order.id, params)
}

export type TSetExpressPlaceOrderParams = {
  /**
   * The Commerce Layer config
   */
  config: CommerceLayerConfig
  /**
   * The order id
   */
  orderId: string
} & (
  | {
      /**
       * The payment resource
       */
      paymentResource: PaymentResource
      /**
       * The payment source id
       */
      paymentSourceId: string
      /**
       * Place the order
       */
      placeTheOrder?: false
    }
  | {
      paymentResource?: never
      paymentSourceId?: never
      placeTheOrder?: true
    }
)

export async function setExpressPlaceOrder({
  config,
  orderId,
  paymentResource,
  paymentSourceId,
  placeTheOrder = false,
}: TSetExpressPlaceOrderParams): Promise<Order> {
  const sdk = getSdk(config)
  if (!placeTheOrder && paymentResource != null && paymentSourceId != null) {
    const include = [
      "shipments.shipping_method",
      "payment_source",
      "payment_method",
    ]
    await sdk.orders.retrieve(orderId, {
      include,
    })
    await sdk[paymentResource].update({
      id: paymentSourceId,
      order: sdk.orders.relationship(orderId),
    })
    await sdk.orders.update({
      id: orderId,
      payment_source: sdk[paymentResource].relationship(paymentSourceId),
    })
    await sdk[paymentResource].update({
      id: paymentSourceId,
      _update: true,
    })
    return await sdk.orders.retrieve(orderId, {
      include,
    })
  }
  return await sdk.orders.update({
    id: orderId,
    _place: true,
  })
}

interface TExpressRedirectUrlParams {
  /**
   * Order resource
   */
  order: Order
  /**
   * The Commerce Layer config
   */
  config: CommerceLayerConfig
}

export async function expressRedirectUrl({
  order,
  config: { accessToken, endpoint },
}: TExpressRedirectUrlParams): Promise<void> {
  if (accessToken == null) throw new Error("No access token found")
  if (endpoint == null) throw new Error("No endpoint found")
  const { slug, domain } = getDomain(endpoint)
  if (slug == null) throw new Error("No slug found")
  const config = await getOrganizationConfig({
    accessToken,
    endpoint,
    params: {
      accessToken,
      slug,
      orderId: order?.id,
    },
  })
  const href =
    config?.links?.checkout != null
      ? config?.links?.checkout
      : getApplicationLink({
          slug,
          orderId: order?.id,
          accessToken,
          applicationType: "checkout",
          domain,
        })
  const isOnTheCheckout = !window.location.pathname.includes("/cart")
  if (isOnTheCheckout) {
    window.location.reload()
  } else {
    window.open(href, "_top")
  }
}
