import React, { ReactNode } from 'react'
import customMessages from '../../utils/customMessages'
import { LineItemCollection } from '@commercelayer/js-sdk'
import { BaseError, ResourceErrorType } from '../../typings/errors'

export type AllErrorsParams = {
  allErrors: BaseError[]
  messages: BaseError[]
  field: string | null
  props: JSX.IntrinsicElements['span']
  lineItem?: LineItemCollection | {}
  resource?: ResourceErrorType
}

export interface GetAllErrors {
  <P extends AllErrorsParams>(params: P): ReactNode
}

const getAllErrors: GetAllErrors = (params) => {
  const { allErrors, messages, field, props, lineItem, resource } = params
  return allErrors.map((v, k): ReactNode | void => {
    const objMsg = customMessages(messages, v)
    if (field) {
      if (v.resource === 'lineItem') {
        return (
          lineItem &&
          v.id === lineItem['id'] && (
            <span key={k} {...props}>
              {objMsg?.message || v.message}
            </span>
          )
        )
      }
      if (field === v.field && resource === v.resource) {
        return (
          <span key={k} {...props}>
            {objMsg?.message || v.message}
          </span>
        )
      }
    }
  })
}

export default getAllErrors
