import type { TResourceError } from '#components/errors/Errors'

export type CodeErrorType =
  | 'EMPTY_ERROR'
  | 'FILTER_NOT_ALLOWED'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'INVALID_DATA_FORMAT'
  | 'INVALID_FIELD'
  | 'INVALID_FIELD_FORMAT'
  | 'INVALID_FIELD_VALUE'
  | 'INVALID_FILTERS_SYNTAX'
  | 'INVALID_FILTER_VALUE'
  | 'INVALID_INCLUDE'
  | 'INVALID_LINKS_OBJECT'
  | 'INVALID_PAGE_OBJECT'
  | 'INVALID_PAGE_VALUE'
  | 'INVALID_RESOURCE'
  | 'INVALID_RESOURCE_ID'
  | 'INVALID_SORT_CRITERIA'
  | 'INVALID_TOKEN'
  | 'KEY_NOT_INCLUDED_IN_URL'
  | 'KEY_ORDER_MISMATCH'
  | 'LOCKED'
  | 'NOT_ACCEPTABLE'
  | 'OUT_OF_STOCK'
  | 'PARAM_MISSING'
  | 'PARAM_NOT_ALLOWED'
  | 'PAYMENT_NOT_APPROVED_FOR_EXECUTION'
  | 'PAYMENT_INTENT_AUTHENTICATION_FAILURE'
  | 'RECORD_NOT_FOUND'
  | 'RECORD_NOT_FOUND'
  | 'RELATION_EXISTS'
  | 'NO_SHIPPING_METHODS'
  | 'SAVE_FAILED'
  | 'TYPE_MISMATCH'
  | 'UNAUTHORIZED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'VALIDATION_ERROR'

export interface BaseError {
  code: CodeErrorType
  message: string
  resource?: TResourceError | null
  field?: string
  id?: string
  title?: string
  detail?: string
  status?: string
}

export interface TAPIError {
  errors: BaseError[]
}
