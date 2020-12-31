import React, { FunctionComponent, useContext, Fragment } from 'react'
import Parent from './utils/Parent'
import GiftCardContext from '@context/GiftCardContext'
import OrderContext from '@context/OrderContext'
import AddressContext from '@context/AddressContext'
import getAllErrors from './utils/getAllErrors'
import LineItemContext from '@context/LineItemContext'
import LineItemChildrenContext from '@context/LineItemChildrenContext'
import { ErrorComponentProps } from '@typings/errors'
import components from '@config/components'

const propTypes = components.Errors.propTypes
const defaultProps = components.Errors.defaultProps
const displayName = components.Errors.displayName

export type ErrorsProps = ErrorComponentProps & JSX.IntrinsicElements['span']

const Errors: FunctionComponent<ErrorsProps> = (props) => {
  const { children, messages = [], resource, field = 'base', ...p } = props
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const { errors: lineItemErrors } = useContext(LineItemContext)
  const { errors: addressErrors } = useContext(AddressContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  // TODO add other errors
  const allErrors = [
    ...(giftCardErrors || []),
    ...(orderErrors || []),
    ...(lineItemErrors || []),
    ...(addressErrors || []),
  ]
  const parentProps = { messages, resource, field, ...p }
  const msgErrors = getAllErrors({
    allErrors,
    field,
    messages,
    props: p,
    lineItem,
    resource,
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
