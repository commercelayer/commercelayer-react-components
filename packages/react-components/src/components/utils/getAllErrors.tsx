import customMessages from '#utils/customMessages'
import type { LineItem } from '@commercelayer/sdk'
import type { BaseError } from '#typings/errors'
import type { TResourceError } from '#components/errors/Errors'

import type { JSX } from "react";

export interface AllErrorsParams {
  allErrors: BaseError[]
  messages: BaseError[]
  field?: string
  props: Omit<JSX.IntrinsicElements['span'], 'ref'>
  lineItem?: LineItem | null
  resource?: TResourceError
  returnHtml?: boolean
}

export type GetAllErrors = <P extends AllErrorsParams>(
  params: P
) => Array<JSX.Element | string | undefined>

const getAllErrors: GetAllErrors = (params) => {
  const {
    allErrors,
    messages,
    field,
    props,
    lineItem,
    resource,
    returnHtml = true
  } = params
  return allErrors
    .map((v, k): JSX.Element | string | undefined => {
      const objMsg = customMessages(messages, v)
      let text =
        v?.title && v?.detail != null && !v.detail?.includes(v.title)
          ? `${v.title} - ${v.detail}`.trim()
          : `${v?.detail || v.message}`.trim()
      if (objMsg?.message) text = objMsg?.message.trim()
      const isEmpty = text.length === 0
      if (field) {
        if (v.resource === 'line_items') {
          if (lineItem && v.id === lineItem.id) {
            return isEmpty ? undefined : returnHtml ? (
              <span key={k} {...props}>
                {text}
              </span>
            ) : (
              text
            )
          }
        }
        if (
          (field === v.field || v.detail?.includes(field)) &&
          resource === v.resource
        ) {
          return isEmpty ? undefined : returnHtml ? (
            <span key={k} {...props}>
              {text}
            </span>
          ) : (
            text
          )
        }
      }
      if (resource === v.resource && !field) {
        return isEmpty ? undefined : returnHtml ? (
          <span key={k} {...props}>
            {text}
          </span>
        ) : (
          text
        )
      }
      return undefined
    })
    .filter((v) => v !== undefined)
}

export default getAllErrors
