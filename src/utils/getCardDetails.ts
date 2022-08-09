import { IconBrand } from '#context/PaymentSourceContext'
import {
  PaymentResource,
  PaymentSourceObject,
} from '#reducers/PaymentMethodReducer'
import { CustomerPaymentSource } from '@commercelayer/sdk'

type CardDetails = {
  brand: IconBrand | string
  last4: string
  exp_month: number | string
  exp_year: number | string
}

type Args = {
  paymentType: PaymentResource
  customerPayment: Partial<CustomerPaymentSource>
}

export default function getCardDetails({
  paymentType,
  customerPayment,
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
          last4: source.last4,
        }
      }
      break
    }
    case 'stripe_payments':
    case 'braintree_payments': {
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
    case 'adyen_payments': {
      const ps =
        customerPayment.payment_source as PaymentSourceObject[typeof paymentType]
      // @ts-ignore
      const source = ps?.payment_request_data?.payment_method
      // @ts-ignore
      const authorized = ps?.payment_response?.resultCode === 'Authorised'
      if (source && authorized) {
        const brand = source.type === 'scheme' ? source.brand : source.type
        return {
          ...source,
          brand,
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
          ...source,
        }
      }
      break
    }
  }
  return {
    brand: '',
    exp_month: '**',
    exp_year: '**',
    last4: '****',
  }
}
