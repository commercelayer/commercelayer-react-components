import React, { FunctionComponent, useContext, Fragment } from 'react'
import { InferProps } from 'prop-types'
import Parent from './utils/Parent'
import GiftCardContext from '../context/GiftCardContext'
import OrderContext from '../context/OrderContext'
import getAllErrors from './utils/getAllErrors'
import LineItemContext from '../context/LineItemContext'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import _ from 'lodash'
import { BaseError } from '../@types/errors'
import components from '../config/components'

const propTypes = components.Errors.propTypes
const defaultProps = components.Errors.defaultProps
const displayName = components.Errors.displayName

export type ErrorsProps = InferProps<typeof propTypes> &
  JSX.IntrinsicElements['span']

const Errors: FunctionComponent<ErrorsProps> = props => {
  const { children, messages, resourceKey, field, ...p } = props
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const { errors: lineItemErrors } = useContext(LineItemContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  const msg = _.isEmpty(messages) ? [] : (messages as BaseError[])
  // TODO add other errors
  const allErrors = [
    ...(giftCardErrors || []),
    ...(orderErrors || []),
    ...(lineItemErrors || [])
  ]
  const parentProps = { messages, resourceKey, field, ...p }
  const msgErrors = getAllErrors({
    allErrors,
    field: field || 'base',
    messages: msg,
    props: p,
    lineItem
  })
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>{msgErrors}</Fragment>
  )
}

Errors.propTypes = propTypes
Errors.defaultProps = defaultProps
Errors.displayName = displayName

export default Errors
