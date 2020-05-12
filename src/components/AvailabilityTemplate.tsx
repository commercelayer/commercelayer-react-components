import React, { useContext, FunctionComponent } from 'react'
import AvailabilityContext from '../context/AvailabilityContext'
import Parent from './utils/Parent'
import _ from 'lodash'
import components from '../config/components'
import { TimeFormat, FunctionChildren } from '../@types/index'
import { LeadTimes, ShippingMethod } from '../reducers/AvailabilityReducer'

const propTypes = components.AvailabilityTemplate.propTypes
const defaultProps = components.AvailabilityTemplate
  .defaultProps as AvailabilityTemplateProps
const displayName = components.AvailabilityTemplate.displayName

type AvailabilityTemplateChildrenProps = Omit<
  AvailabilityTemplateProps,
  'children'
> & {
  min: LeadTimes
  max: LeadTimes
  shippingMethod: ShippingMethod
}

type AvailabilityTemplateProps = {
  children?: FunctionChildren<AvailabilityTemplateChildrenProps>
  timeFormat?: TimeFormat
  showShippingMethodName?: boolean
} & JSX.IntrinsicElements['p']

const AvailabilityTemplate: FunctionComponent<AvailabilityTemplateProps> = (
  props
) => {
  const { timeFormat, showShippingMethodName, children, ...p } = props
  const { min, max, shippingMethod } = useContext(AvailabilityContext)
  const mn = !_.isEmpty(min) ? min[`${timeFormat}`] : ''
  const mx = !_.isEmpty(max) ? max[`${timeFormat}`] : ''
  const name =
    showShippingMethodName && shippingMethod
      ? `with ${shippingMethod.name}`
      : ''
  const text =
    mn && mx ? `Available in ${mn} - ${mx} ${timeFormat} ${name}` : ''
  const parentProps = {
    min,
    max,
    shippingMethod,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{text}</p>
  )
}

AvailabilityTemplate.propTypes = propTypes
AvailabilityTemplate.defaultProps = defaultProps
AvailabilityTemplate.displayName = displayName

export default AvailabilityTemplate
