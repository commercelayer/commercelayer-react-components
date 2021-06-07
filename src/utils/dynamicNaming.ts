import {
  PaymentResource,
  SDKPaymentResource,
} from '#reducers/PaymentMethodReducer'
import CLayer from '@commercelayer/js-sdk'
import last from 'lodash/last'
import startCase from 'lodash/startCase'

type DynamicNaming = (
  resource: PaymentResource,
  _type?: 'payments'
) => typeof CLayer[SDKPaymentResource]

const dynamicNaming: DynamicNaming = (resource, _type = 'payments') => {
  let resourceKey = startCase(resource).split(' ')
  const lastIndex = resourceKey.length - 1
  const lastItem = last(resourceKey)
  if (lastItem?.toLowerCase() === 'payments')
    resourceKey[lastIndex] = lastItem.replace('Payments', 'Payment')
  if (lastItem?.toLowerCase() === 'transfers')
    resourceKey[lastIndex] = lastItem.replace('Transfers', 'Transfer')
  return CLayer[resourceKey.join('') as SDKPaymentResource]
}

export default dynamicNaming
