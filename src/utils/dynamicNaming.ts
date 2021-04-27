import {
  PaymentResource,
  SDKPaymentResource,
} from '#reducers/PaymentMethodReducer'
import CLayer from '@commercelayer/js-sdk'
// import capitalize from 'lodash/capitalize'
// import camelCase from 'lodash/camelCase'
import startCase from 'lodash/startCase'

type DynamicNaming = (
  resource: PaymentResource,
  type?: 'payments'
) => typeof CLayer[SDKPaymentResource]

const dynamicNaming: DynamicNaming = (resource, type = 'payments') => {
  let resourceKey = startCase(resource).replace(' ', '')
  if (type === 'payments')
    resourceKey = resourceKey.replace('Payments', 'Payment')
  return CLayer[resourceKey as SDKPaymentResource]
}

export default dynamicNaming
