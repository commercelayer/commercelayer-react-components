import PropTypes from 'prop-types'
import { ReactNode } from 'react'
import { type } from 'os'

export type CodeErrorType =
  | 'RECORD_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'VALIDATION_ERROR'
  | 'INVALID_RESOURCE'
  | 'FILTER_NOT_ALLOWED'
  | 'INVALID_FIELD_VALUE'
  | 'INVALID_FIELD'
  | 'PARAM_NOT_ALLOWED'
  | 'PARAM_MISSING'
  | 'INVALID_FILTER_VALUE'
  | 'KEY_ORDER_MISMATCH'
  | 'KEY_NOT_INCLUDED_IN_URL'
  | 'INVALID_INCLUDE'
  | 'RELATION_EXISTS'
  | 'INVALID_SORT_CRITERIA'
  | 'INVALID_LINKS_OBJECT'
  | 'TYPE_MISMATCH'
  | 'INVALID_PAGE_OBJECT'
  | 'INVALID_PAGE_VALUE'
  | 'INVALID_FIELD_FORMAT'
  | 'INVALID_FILTERS_SYNTAX'
  | 'SAVE_FAILED'
  | 'INVALID_DATA_FORMAT'
  | 'FORBIDDEN'
  | 'RECORD_NOT_FOUND'
  | 'NOT_ACCEPTABLE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'LOCKED'
  | 'INTERNAL_SERVER_ERROR'

export type ResourceErrorType =
  | 'order'
  | 'giftCard'
  | 'lineItem'
  | 'variant'
  | 'price'
  | 'skuOption'

const CEType: CodeErrorType[] = [
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
]

export interface BaseError {
  code: CodeErrorType
  message: string
  resourceKey?: ResourceErrorType
  field?: string
  id?: string
}

export const REType: ResourceErrorType[] = [
  'order',
  'giftCard',
  'lineItem',
  'variant',
  'price',
  'skuOption',
]

export const BaseErrorObject = PropTypes.shape({
  code: PropTypes.oneOf(CEType).isRequired,
  message: PropTypes.string.isRequired,
  resource: PropTypes.oneOf(REType),
  field: PropTypes.string,
  id: PropTypes.string,
})

export const ErrorPropTypes = {
  resource: PropTypes.oneOf<ResourceErrorType>([
    'order',
    'giftCard',
    'lineItem',
    'variant',
    'price',
    'skuOption',
  ]).isRequired,
  children: PropTypes.func,
  field: PropTypes.string,
  messages: PropTypes.arrayOf(BaseErrorObject.isRequired),
}

type ErrorChildrenComponentProps = Omit<ErrorComponentProps, 'children'>

export interface ErrorComponentProps {
  resource: ResourceErrorType
  children?: (props: ErrorChildrenComponentProps) => ReactNode
  field?: string
  messages?: {
    code: CodeErrorType
    message: string
    resource?: ResourceErrorType
    field?: string
    id?: string
  }[]
}
