import { CodeErrorType, ResourceErrorType, BaseError } from '#typings/errors'
import BaseClass from '@commercelayer/js-sdk/dist/utils/BaseClass'
import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import isArray from 'lodash/isArray'

const ERROR_CODES: CodeErrorType[] = [
  'RECORD_NOT_FOUND',
  'UNAUTHORIZED',
  'INVALID_TOKEN',
  'VALIDATION_ERROR',
  'INVALID_RESOURCE',
  'FILTER_NOT_ALLOWED',
  'INVALID_FIELD_VALUE',
  'INVALID_FIELD',
  'PARAM_NOT_ALLOWED',
  'PARAM_MISSING',
  'INVALID_FILTER_VALUE',
  'KEY_ORDER_MISMATCH',
  'KEY_NOT_INCLUDED_IN_URL',
  'INVALID_INCLUDE',
  'RELATION_EXISTS',
  'INVALID_SORT_CRITERIA',
  'INVALID_LINKS_OBJECT',
  'TYPE_MISMATCH',
  'INVALID_PAGE_OBJECT',
  'INVALID_PAGE_VALUE',
  'INVALID_FIELD_FORMAT',
  'INVALID_FILTERS_SYNTAX',
  'SAVE_FAILED',
  'INVALID_DATA_FORMAT',
  'FORBIDDEN',
  'RECORD_NOT_FOUND',
  'NOT_ACCEPTABLE',
  'UNSUPPORTED_MEDIA_TYPE',
  'LOCKED',
  'INTERNAL_SERVER_ERROR',
  'PAYMENT_INTENT_AUTHENTICATION_FAILURE',
]

export type GetErrorsByCollection = <C extends BaseClass>(
  collection: C,
  resourceType: ResourceErrorType
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

const getErrorsByCollection: GetErrorsByCollection = (
  collection,
  resourceType
) => {
  const errors: BaseError[] = []
  if (isFunction(collection?.errors) && !collection?.errors().empty()) {
    collection
      .errors()
      .toArray()
      .map((error) => {
        // TODO Add function to correct different field
        if (error['field'] === 'recipientEmail') error['field'] = 'email'
        errors.push({
          id: get(collection, 'id'),
          code: transformCode(error['code']),
          field: error['field'] === 'recipientEmail' ? 'email' : error['field'],
          resource: resourceType,
          message: error['message'],
        })
      })
  } else if (isArray(collection)) {
    collection.map((error) => {
      errors.push({
        // id: collection['id'],
        code: transformCode(error['code']),
        field: error['field'] === 'recipientEmail' ? 'email' : error['field'],
        resource: resourceType,
        message: error['message'],
      })
    })
  }
  return errors
}

export default getErrorsByCollection
