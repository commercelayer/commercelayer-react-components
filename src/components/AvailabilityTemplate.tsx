import React, { useContext, FunctionComponent } from 'react'
import AvailabilityContext from '../context/AvailabilityContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types/index'
import _ from 'lodash'
import PropTypes, { InferProps } from 'prop-types'

type TimeFormat = 'days' | 'hours'

const ATProps = {
  timeFormat: PropTypes.oneOf<TimeFormat>(['days', 'hours']),
  showShippingMethodName: PropTypes.bool,
  children: PropTypes.func
}

export type AvailabilityTemplateProps = InferProps<typeof ATProps> &
  BaseComponent

const AvailabilityTemplate: FunctionComponent<AvailabilityTemplateProps> = props => {
  const { timeFormat, showShippingMethodName, children, ...p } = props
  const { min, max, shippingMethod } = useContext(AvailabilityContext)
  const mn = !_.isEmpty(min) ? min[timeFormat] : ''
  const mx = !_.isEmpty(max) ? max[timeFormat] : ''
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
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <p {...p}>{text}</p>
  )
}

AvailabilityTemplate.defaultProps = {
  timeFormat: 'days',
  showShippingMethodName: false
}

AvailabilityTemplate.propTypes = ATProps

export default AvailabilityTemplate
