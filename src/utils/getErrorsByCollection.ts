import { CodeErrorType, ResourceErrorType, BaseError } from '#typings/errors'
import BaseClass from '@commercelayer/js-sdk/dist/utils/BaseClass'
import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import isArray from 'lodash/isArray'

const ERROR_CODES: CodeErrorType[] = [
  'FILTER_NOT_ALLOWED',
  'FORBIDDEN',
  'INTERNAL_SERVER_ERROR',
  'INVALID_DATA_FORMAT',
  'INVALID_FIELD',
  'INVALID_FIELD_FORMAT',
  'INVALID_FIELD_VALUE',
  'INVALID_FILTERS_SYNTAX',
  'INVALID_FILTER_VALUE',
  'INVALID_INCLUDE',
  'INVALID_LINKS_OBJECT',
  'INVALID_PAGE_OBJECT',
  'INVALID_PAGE_VALUE',
  'INVALID_RESOURCE',
  'INVALID_RESOURCE_ID',
  'INVALID_SORT_CRITERIA',
  'INVALID_TOKEN',
  'KEY_NOT_INCLUDED_IN_URL',
  'KEY_ORDER_MISMATCH',
  'LOCKED',
  'NOT_ACCEPTABLE',
  'PARAM_MISSING',
  'PARAM_NOT_ALLOWED',
  'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
  'RECORD_NOT_FOUND',
  'RECORD_NOT_FOUND',
  'RELATION_EXISTS',
  'SAVE_FAILED',
  'TYPE_MISMATCH',
  'UNAUTHORIZED',
  'UNSUPPORTED_MEDIA_TYPE',
  'VALIDATION_ERROR',
]

export type GetErrorsByCollection = <C extends BaseClass>(
  collection: C,
  resourceType: ResourceErrorType,
  options?: {
    field?: string
    id?: string
  }
) => BaseError[]

export interface TransformCode {
  (code: string): CodeErrorType
}

const transformCode: TransformCode = (code) => {
  let newCode = '' as CodeErrorType
  ERROR_CODES.map((c) => {
    const checkCode: string[] = []
    const words = c.split('_')
    words.map((w) => {
      const rgx = new RegExp(`(?:s|${w})`, 'g')
      const m = code.match(rgx)
      if (m && m?.length > 0) {
        checkCode.push(m[0])
      }
    })
    if (checkCode.length === words.length) {
      newCode = c
    }
  })
  return newCode
}

function getErrorCodeByString<C extends string>(
  text: string,
  codes: C[]
): C | undefined {
  let code: C | undefined
  codes?.map((c) => {
    if (text.search(c) !== -1) {
      code = c
    }
  })
  return code
}

const getErrorsByCollection: GetErrorsByCollection = (
  collection,
  resourceType,
  options
) => {
  const errors: BaseError[] = []
  if (isFunction(collection?.errors) && !collection?.errors().empty()) {
    collection
      .errors()
      .toArray()
      .map((error) => {
        // TODO Add function to correct different field
        if (error['field'] === 'recipientEmail') error['field'] = 'email'
        const e = {
          id: options?.id || get(collection, 'id'),
          code:
            getErrorCodeByString(error['message'], ERROR_CODES) ||
            transformCode(error['code']),
          field:
            error['field'] === 'recipientEmail'
              ? 'email'
              : options?.field || error['field'],
          resource: resourceType,
          message: error['message'],
        }
        errors.push(e)
      })
  } else if (isArray(collection)) {
    collection.map((error) => {
      errors.push({
        // id: collection['id'],
        code:
          getErrorCodeByString(error['message'], ERROR_CODES) ||
          transformCode(error['code']),
        field: error['field'] === 'recipientEmail' ? 'email' : error['field'],
        resource: resourceType,
        message: error['message'],
      })
    })
  }
  return errors
}

export default getErrorsByCollection
