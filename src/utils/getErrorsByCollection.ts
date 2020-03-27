import { Collection } from '@commercelayer/js-sdk'
import {
  BaseError,
  ResourceErrorType,
  CodeErrorType
} from '../components/Errors'

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
  'INTERNAL_SERVER_ERROR'
]

export interface GetErrorsByCollection {
  <C extends Collection<C>>(
    collection: C,
    resourceType: ResourceErrorType
  ): BaseError[]
}

export interface TransformCode {
  (code: string): CodeErrorType
}

const trasformCode: TransformCode = code => {
  let newCode = '' as CodeErrorType
  ERROR_CODES.map(c => {
    const checkCode: string[] = []
    const words = c.split('_')
    words.map(w => {
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
  if (collection.errors) {
    collection.errors().each((field, error) => {
      // TODO Add function to correct different field
      if (error.field === 'recipientEmail') error.field = 'email'
      error.code = trasformCode(error.code)
      error['resourceKey'] = resourceType
      // NOTE Add type to SDK
      // @ts-ignore
      error['id'] = collection.id
      errors.push(error)
    })
  }
  return errors
}

export default getErrorsByCollection
