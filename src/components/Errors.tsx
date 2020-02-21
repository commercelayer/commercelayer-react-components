import React, { FunctionComponent, useContext, Fragment } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../@types/index'
import Parent from './utils/Parent'
import GiftCardContext from '../context/GiftCardContext'
import OrderContext from '../context/OrderContext'
import getAllErrors from './utils/getAllErrors'

export type ResourceErrorType =
  | 'order'
  | 'giftCard'
  | 'lineItem'
  | 'variant'
  | 'price'

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

export interface BaseError {
  code: CodeErrorType
  message: string
  resourceKey?: ResourceErrorType
  field?: string
}

export interface ErrorsProps extends BaseComponent {
  resourceKey: ResourceErrorType
  messages?: BaseError[]
  field?: string | undefined
  children?: FunctionComponent
}

const Errors: FunctionComponent<ErrorsProps> = props => {
  const { children, messages, resourceKey, field, ...p } = props
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const allErrors = orderErrors.concat(giftCardErrors)
  const parentProps = { messages, resourceKey, field, ...p }
  const msgErrors = getAllErrors({ allErrors, field, messages, props: p })
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>{msgErrors}</Fragment>
  )
}

Errors.propTypes = {
  resourceKey: PropTypes.oneOf<ResourceErrorType>([
    'order',
    'giftCard',
    'lineItem',
    'variant'
  ]).isRequired,
  children: PropTypes.func,
  field: PropTypes.string
}

Errors.defaultProps = {
  messages: [],
  field: 'base'
}

export default Errors
