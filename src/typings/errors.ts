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
  | 'INVALID_RESOURCE_ID'
  | 'INVALID_SORT_CRITERIA'
  | 'INVALID_TOKEN'
  | 'KEY_NOT_INCLUDED_IN_URL'
  | 'KEY_ORDER_MISMATCH'
  | 'LOCKED'
  | 'NOT_ACCEPTABLE'
  | 'PARAM_MISSING'
  | 'PARAM_NOT_ALLOWED'
  | 'PAYMENT_NOT_APPROVED_FOR_EXECUTION'
  | 'PAYMENT_INTENT_AUTHENTICATION_FAILURE'
  | 'RECORD_NOT_FOUND'
  | 'RECORD_NOT_FOUND'
  | 'RELATION_EXISTS'
  | 'SAVE_FAILED'
  | 'TYPE_MISMATCH'
  | 'UNAUTHORIZED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'VALIDATION_ERROR'

export type ResourceErrorType =
  | 'address'
  | 'billingAddress'
  | 'customerAddress'
  | 'giftCard'
  | 'giftCardOrCouponCode'
  | 'lineItem'
  | 'order'
  | 'paymentMethod'
  | 'price'
  | 'shippingAddress'
  | 'skuOption'
  | 'variant'

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
  'INVALID_RESOURCE_ID',
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
  'giftCard',
  'lineItem',
  'order',
  'price',
  'skuOption',
  'variant',
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
    'billingAddress',
    'giftCard',
    'lineItem',
    'order',
    'paymentMethod',
    'price',
    'shippingAddress',
    'skuOption',
    'variant',
  ]).isRequired,
  children: PropTypes.func,
  field: PropTypes.string,
  // messages: PropTypes.arrayOf(BaseErrorObject.isRequired),
}

type ErrorChildrenComponentProps = FunctionChildren<
  Omit<ErrorComponentProps, 'children'> & { errors: string[] }
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
