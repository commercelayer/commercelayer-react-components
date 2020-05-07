import React, { Fragment, FunctionComponent } from 'react'
import { PPropsType } from '../Price'
import PropTypes from 'prop-types'

const propTypes = {
  formattedAmount: PropTypes.string,
  formattedCompare: PropTypes.string,
}
const defaultProps = {
  formattedAmount: '',
  formattedCompare: '',
}

export type PTemplateProps = {
  formattedAmount?: string
  formattedCompare?: string
} & PPropsType &
  JSX.IntrinsicElements['span']

const PriceTemplate: FunctionComponent<PTemplateProps> = (props) => {
  return (
    <Fragment>
      <span className={props.className}>{props.formattedAmount}</span>
      {props.showCompare && (
        <span className={props.compareClassName || ''}>
          {props.formattedCompare}
        </span>
      )}
    </Fragment>
  )
}

PriceTemplate.propTypes = propTypes
PriceTemplate.defaultProps = defaultProps

export default PriceTemplate
