import PropTypes from 'prop-types'
import { FunctionChildren } from './index'

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
  | 'INVALID_SORT_CRITERIA'
  | 'INVALID_TOKEN'
  | 'KEY_NOT_INCLUDED_IN_URL'
  | 'KEY_ORDER_MISMATCH'
  | 'LOCKED'
  | 'NOT_ACCEPTABLE'
  | 'PARAM_MISSING'
  | 'PARAM_NOT_ALLOWED'
  | 'RECORD_NOT_FOUND'
  | 'RECORD_NOT_FOUND'
  | 'RELATION_EXISTS'
  | 'SAVE_FAILED'
  | 'TYPE_MISMATCH'
  | 'UNAUTHORIZED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'VALIDATION_ERROR'

export type ResourceErrorType =
  | 'order'
  | 'giftCard'
  | 'lineItem'
  | 'variant'
  | 'price'
  | 'skuOption'
  | 'billingAddress'
  | 'shippingAddress'

const CEType: CodeErrorType[] = [
  'EMPTY_ERROR',
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
  'INVALID_SORT_CRITERIA',
  'INVALID_TOKEN',
  'KEY_NOT_INCLUDED_IN_URL',
  'KEY_ORDER_MISMATCH',
  'LOCKED',
  'NOT_ACCEPTABLE',
  'PARAM_MISSING',
  'PARAM_NOT_ALLOWED',
  'RECORD_NOT_FOUND',
  'RECORD_NOT_FOUND',
  'RELATION_EXISTS',
  'SAVE_FAILED',
  'TYPE_MISMATCH',
  'UNAUTHORIZED',
  'UNSUPPORTED_MEDIA_TYPE',
  'VALIDATION_ERROR',
]

export interface BaseError {
  code: CodeErrorType
  message: string
  resource?: ResourceErrorType | null
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
    'billingAddress',
    'shippingAddress',
  ]).isRequired,
  children: PropTypes.func,
  field: PropTypes.string,
  // messages: PropTypes.arrayOf(BaseErrorObject.isRequired),
}

type ErrorChildrenComponentProps = FunctionChildren<
  Omit<ErrorComponentProps, 'children'>
>

export interface ErrorComponentProps {
  resource: ResourceErrorType
  children?: ErrorChildrenComponentProps
  field?: string
  messages?: {
    code: CodeErrorType
    message: string
    resource?: ResourceErrorType
    field?: string
    id?: string
  }[]
}
