import React, { ReactNode } from 'react'
import customMessages from '#utils/customMessages'
import { LineItem } from '@commercelayer/sdk'
import { BaseError, ResourceErrorType } from '#typings/errors'

export type AllErrorsParams = {
  allErrors: BaseError[]
  messages: BaseError[]
  field?: string
  props: JSX.IntrinsicElements['span']
  lineItem?: LineItem
  resource?: ResourceErrorType
  returnHtml?: boolean
}

export interface GetAllErrors {
  <P extends AllErrorsParams>(params: P): ReactNode
}

const getAllErrors: GetAllErrors = (params) => {
  const {
    allErrors,
    messages,
    field,
    props,
    lineItem,
    resource,
    returnHtml = true,
  } = params
  return allErrors.map((v, k): ReactNode | void => {
    const objMsg = customMessages(messages, v)
    let text =
      v?.title && !v.detail?.includes(v.title)
        ? `${v.title} - ${v.detail}`
        : `${v.detail}`
    if (objMsg?.message) text = objMsg?.message
    if (field) {
      if (v.resource === 'line_items') {
        if (lineItem && v.id === lineItem['id']) {
          return returnHtml ? (
            <span key={k} {...props}>
              {text}
            </span>
          ) : (
            text
          )
        }
      }
      if (field === v.field && resource === v.resource) {
        return returnHtml ? (
          <span key={k} {...props}>
            {text}
          </span>
        ) : (
          text
        )
      }
    }
    if (resource === v.resource && !field) {
      return returnHtml ? (
        <span key={k} {...props}>
          {text}
        </span>
      ) : (
        text
      )
    }
  })
}

export default getAllErrors
