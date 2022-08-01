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
    case 'stripe_payments': {
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
