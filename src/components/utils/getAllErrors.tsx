import React, { ReactNode } from 'react'
import customMessages from '../../utils/customMessages'
import { BaseError } from '../Errors'
import { BaseComponent } from '../../@types/index'

export type AllErrorsParams = {
  allErrors: BaseError[]
  messages: BaseError[]
  field: string
  props: BaseComponent
}

export interface GetAllErrors {
  <P extends AllErrorsParams>(params: P): ReactNode
}

const getAllErrors: GetAllErrors = params => {
  const { allErrors, messages, field, props } = params
  return allErrors.map((v, k) => {
    const objMsg = customMessages(messages, v)
    if (field) {
      return (
        field === v.field && (
          <span key={k} {...props}>
            {objMsg?.message || v.message}
          </span>
        )
      )
    }
    return (
      <span key={k} {...props}>
        {objMsg?.message || v.message}
      </span>
    )
  })
}

export default getAllErrors
