import React, { useContext, FunctionComponent } from 'react'
import AvailabilityContext from '../context/AvailabilityContext'
import Parent from './utils/Parent'
import { GeneralComponent } from '../@types/index'
import _ from 'lodash'

export interface AvailabilityTemplateProps extends GeneralComponent {
  children?: FunctionComponent
  timeFormat?: 'days' | 'hours'
  showShippingMethodName?: boolean
}

const AvailabilityTemplate: FunctionComponent<AvailabilityTemplateProps> = props => {
  const { timeFormat, showShippingMethodName, children, ...p } = props
  const { min, max, shippingMethod } = useContext(AvailabilityContext)
  const mn = !_.isEmpty(min) ? min[timeFormat] : ''
  const mx = !_.isEmpty(max) ? max[timeFormat] : ''
  const name = showShippingMethodName ? `with ${shippingMethod.name}` : ''
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

export default AvailabilityTemplate
