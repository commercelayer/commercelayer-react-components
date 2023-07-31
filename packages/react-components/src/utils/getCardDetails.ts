import { type IconBrand } from '#context/PaymentSourceContext'
import {
  type PaymentResource,
  type PaymentSourceObject
} from '#reducers/PaymentMethodReducer'
import { type CustomerPaymentSource } from '@commercelayer/sdk'

interface CardDetails {
  brand: IconBrand | string
  last4: string
  exp_month: number | string
  exp_year: number | string
}

interface Args {
  paymentType: PaymentResource
  customerPayment: Partial<CustomerPaymentSource>
}

export default function getCardDetails({
  paymentType,
  customerPayment
}: Args): CardDetails {
  switch (paymentType) {
    case 'checkout_com_payments': {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.payment_response?.source
      if (source) {
        return {
          brand: source.scheme.toLowerCase() as IconBrand,
          exp_month: source.expiry_month,
          exp_year: source.expiry_year,
          last4: source.last4
        }
      }
      break
    }
    case 'stripe_payments': {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.options?.card ?? ps?.payment_method?.card
      if (source) {
        return {
          ...source
        }
      }
      break
    }
    case 'braintree_payments': {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.options?.card
      if (source) {
        return {
          ...source
        }
      }
      break
    }
    case 'adyen_payments': {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.payment_request_data?.payment_method
      const authorized = ps?.payment_response?.resultCode === 'Authorised'
      const last4 =
        ps?.payment_response?.['additionalData']?.cardSummary ??
        ps?.payment_instrument?.['card_last_digits'] ??
        '****'
      if (source && authorized) {
        const brand =
          source.type === 'scheme'
            ? source.brand ?? 'credit-card'
            : source.type.replace('_account', '')
        return {
          ...source,
          last4,
          brand
        }
      }
      break
    }
    default: {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      const source = ps?.metadata?.['card']
      if (source) {
        return {
          ...source
        }
      }
      break
    }
  }
  return {
    brand: '',
    exp_month: '**',
    exp_year: '**',
    last4: '****'
  }
}
