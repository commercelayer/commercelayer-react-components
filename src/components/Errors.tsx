import React, { FunctionComponent, useContext, Fragment } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../@types/index'
import Parent from './utils/Parent'
import GiftCardContext from '../context/GiftCardContext'
import OrderContext from '../context/OrderContext'
import getAllErrors from './utils/getAllErrors'

export type BaseErrorType = 'order' | 'giftCard' | 'lineItem' | 'variant'

export interface BaseError {
  code: string
  message: string
  base?: BaseErrorType
  field?: string
}

export interface ErrorsProps extends BaseComponent {
  base: BaseErrorType
  messages?: BaseError[]
  field?: string
  children?: FunctionComponent
}

const Errors: FunctionComponent<ErrorsProps> = props => {
  const { children, messages, base, field, ...p } = props
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const allErrors = orderErrors.concat(giftCardErrors)
  const parentProps = { messages, base, field, ...p }
  const msgErrors = getAllErrors({ allErrors, field, messages, props: p })
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>{msgErrors}</Fragment>
  )
}

Errors.propTypes = {
  base: PropTypes.oneOf<BaseErrorType>([
    'order',
    'giftCard',
    'lineItem',
    'variant'
  ]).isRequired,
  children: PropTypes.func,
  field: PropTypes.string
}

Errors.defaultProps = {
  messages: []
}

export default Errors
