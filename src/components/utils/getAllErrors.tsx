import React, { ReactNode } from 'react'
import customMessages from '../../utils/customMessages'
import { BaseError } from '../Errors'
import { BaseComponent } from '../../@types/index'
import { LineItemCollection } from '@commercelayer/js-sdk'

export type AllErrorsParams = {
  allErrors: BaseError[]
  messages: BaseError[]
  field: string
  props: BaseComponent
  lineItem?: LineItemCollection
}

export interface GetAllErrors {
  <P extends AllErrorsParams>(params: P): ReactNode
}

const getAllErrors: GetAllErrors = params => {
  const { allErrors, messages, field, props, lineItem } = params
  return allErrors.map((v, k) => {
    const objMsg = customMessages(messages, v)
    if (field) {
      if (v.resourceKey === 'lineItem') {
        return (
          v.id === lineItem.id && (
            <span key={k} {...props}>
              {objMsg?.message || v.message}
            </span>
          )
        )
      }
      return (
        field === v.field && (
          <span key={k} {...props}>
            {objMsg?.message || v.message}
          </span>
        )
      )
    }
  })
}

export default getAllErrors
