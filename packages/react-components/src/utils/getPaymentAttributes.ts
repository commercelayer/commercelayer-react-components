import type { PaypalConfig } from '#components/payment_source/PaypalPayment'
import {
  getPaymentConfig,
  type PaymentMethodConfig,
  type PaymentResource
} from '#reducers/PaymentMethodReducer'
import type { ExternalPayment } from '@commercelayer/sdk'
import { pick } from './pick'
import { replace, type StringReplace } from './replace'
import { type SnakeToCamelCase, snakeToCamelCase } from './snakeToCamelCase'
import type { StripeConfig } from '#components/payment_source/StripePayment'

interface Params<R extends PaymentResource, C extends PaymentMethodConfig> {
  resource: R
  config: C
  keys: R[]
}

export type ResourceKeys<K extends PaymentResource> = SnakeToCamelCase<
  StringReplace<
    StringReplace<K, 'payments', 'payment'>,
    'transfers',
    'transfer'
  >
>

export function getPaymentAttributes<
  R extends PaymentResource = PaymentResource,
  C extends PaymentMethodConfig = PaymentMethodConfig
>(params: Params<R, C>): Pick<C, ResourceKeys<R>> | undefined {
  const { resource, config, keys } = params
  const attributes = getPaymentConfig(resource, config)
  const keysCamelCase: ResourceKeys<R>[] = keys.map((key) => {
    const k = replace(
      replace(key, 'payments', 'payment'),
      'transfers',
      'transfer'
    )
    return snakeToCamelCase(k)
  })
  const currentResource = snakeToCamelCase(
    replace(replace(resource, 'payments', 'payment'), 'transfers', 'transfer')
  )
  return attributes != null && currentResource in attributes
    ? pick(attributes, keysCamelCase)
    : undefined
}

export function getPaypalAttributes(
  paymentResource: PaymentResource,
  config: PaymentMethodConfig
): Pick<PaypalConfig, 'return_url' | 'cancel_url'> | undefined {
  const attributes = getPaymentAttributes({
    resource: paymentResource,
    config,
    keys: ['paypal_payments']
  })
  return attributes?.paypalPayment != null && 'paypalPayment' in attributes
    ? pick(attributes?.paypalPayment, ['return_url', 'cancel_url'])
    : undefined
}

export function getExternalPaymentAttributes(
  paymentResource: PaymentResource,
  config: PaymentMethodConfig
): Pick<ExternalPayment, 'payment_source_token'> | undefined {
  const attributes = getPaymentAttributes({
    resource: paymentResource,
    config,
    keys: ['external_payments']
  })
  return attributes?.externalPayment != null && 'externalPayment' in attributes
    ? pick(attributes?.externalPayment, ['payment_source_token'])
    : undefined
}

export function getStripeAttributes(
  paymentResource: PaymentResource,
  config: PaymentMethodConfig
): Pick<StripeConfig, 'return_url'> | undefined {
  const attributes = getPaymentAttributes({
    resource: paymentResource,
    config,
    keys: ['stripe_payments']
  })
  return attributes?.stripePayment != null && 'stripePayment' in attributes
    ? pick(attributes?.stripePayment, ['return_url'])
    : undefined
}
