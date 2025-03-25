import type { IconBrand } from "#context/PaymentSourceContext"
import type {
  PaymentResource,
  PaymentSourceObject,
} from "#reducers/PaymentMethodReducer"
import type { CustomerPaymentSource } from "@commercelayer/sdk"

interface CardDetails {
  brand: IconBrand | string
  last4: string
  exp_month: number | string
  exp_year: number | string
  issuer_type?: string
}

interface Args {
  paymentType: PaymentResource
  customerPayment: Partial<CustomerPaymentSource>
}

export default function getCardDetails({
  paymentType,
  customerPayment,
}: Args): CardDetails {
  switch (paymentType) {
    case "checkout_com_payments": {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.payment_response?.source
      if (source) {
        return {
          brand: source.scheme.toLowerCase() as IconBrand,
          exp_month: source.expiry_month,
          exp_year: source.expiry_year,
          last4: source.last4,
        }
      }
      break
    }
    case "stripe_payments": {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source =
        (ps?.options?.card ??
        ps?.payment_method?.card ??
        ps?.payment_instrument)
          ? {
              brand: ps?.payment_instrument?.["card_type"],
              exp_month: ps?.payment_instrument?.["card_expiry_month"],
              exp_year: ps?.payment_instrument?.["card_expiry_year"],
              last4: ps?.payment_instrument?.["card_last_digits"],
              issuer_type: ps?.payment_instrument?.["issuer_type"],
            }
          : undefined
      if (source?.brand != null) {
        return {
          ...source,
        }
      }
      break
    }
    case "klarna_payments": {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source =
        ps?.auth_token != null && ps?.payment_instrument != null
          ? {
              brand: "klarna",
              exp_month: "",
              exp_year: "",
              last4: "",
              issuer_type: ps?.payment_instrument?.["issuer_type"],
            }
          : undefined
      if (source) {
        return {
          ...source,
        }
      }
      break
    }
    case "braintree_payments": {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.options?.card
      if (source) {
        return {
          ...source,
        }
      }
      break
    }
    case "adyen_payments": {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.payment_request_data?.payment_method
      const authorized = ps?.payment_response?.resultCode === "Authorised"
      const last4 =
        ps?.payment_response?.["additionalData"]?.cardSummary ??
        ps?.payment_instrument?.["card_last_digits"] ??
        "****"
      if (source && authorized) {
        const brand =
          source.type === "scheme"
            ? (source.brand ?? "credit-card")
            : source.type.replace("_account", "")
        return {
          ...source,
          last4,
          brand,
        }
      }
      break
    }
    default: {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      if (ps?.type !== paymentType) break
      const source = ps?.metadata?.["card"] ?? {
        brand: ps?.payment_instrument?.["issuer_type"].replace("_", "-") ?? "",
        last4: ps?.metadata?.["last4"] ?? "",
        exp_month: ps?.metadata?.["exp_month"] ?? "",
        exp_year: ps?.metadata?.["exp_year"] ?? "",
      }
      if (source) {
        return {
          ...source,
        }
      }
      break
    }
  }
  return {
    brand: "",
    exp_month: "**",
    exp_year: "**",
    last4: "****",
    issuer_type: "",
  }
}
