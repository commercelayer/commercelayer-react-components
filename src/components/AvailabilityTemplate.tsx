import React, { useContext, FunctionComponent } from 'react'
import AvailabilityContext from '#context/AvailabilityContext'
import Parent from './utils/Parent'
import _ from 'lodash'
import components from '#config/components'
import { TimeFormat, FunctionChildren } from '#typings/index'
import { LeadTimes, ShippingMethod } from '#reducers/AvailabilityReducer'

const propTypes = components.AvailabilityTemplate.propTypes
const defaultProps = components.AvailabilityTemplate
  .defaultProps as AvailabilityTemplateProps
const displayName = components.AvailabilityTemplate.displayName

type AvailabilityTemplateChildrenProps = FunctionChildren<
  Omit<AvailabilityTemplateProps, 'children'> & {
    min: LeadTimes
    max: LeadTimes
    shippingMethod: ShippingMethod
  }
>

type AvailabilityTemplateProps = {
  children?: AvailabilityTemplateChildrenProps
  timeFormat?: TimeFormat
  showShippingMethodName?: boolean
} & JSX.IntrinsicElements['p']

const AvailabilityTemplate: FunctionComponent<AvailabilityTemplateProps> = (
  props
) => {
  const { timeFormat, showShippingMethodName, children, ...p } = props
  const { min, max, shippingMethod, quantity } = useContext(AvailabilityContext)
  const mn = !_.isEmpty(min) ? min[`${timeFormat}`] : ''
  const mx = !_.isEmpty(max) ? max[`${timeFormat}`] : ''
  const text: string[] = []
  const name =
    showShippingMethodName && shippingMethod
      ? `with ${shippingMethod.name}`
      : ''
  if (quantity && quantity > 0) {
    text.push('Available')
    if (mn && mx) {
      text.push(`in ${mn} - ${mx} ${timeFormat} ${name}`)
    }
  } else if (quantity === 0) {
    text.push('Out of stock')
  }
  const parentProps = {
    min,
    max,
    shippingMethod,
    quantity,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{text.join(' ')}</p>
  )
}

AvailabilityTemplate.propTypes = propTypes
AvailabilityTemplate.defaultProps = defaultProps
AvailabilityTemplate.displayName = displayName

export default AvailabilityTemplate
