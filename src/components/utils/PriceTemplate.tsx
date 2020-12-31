import React, { Fragment, FunctionComponent } from 'react'
import { PriceProps } from '@Price'
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
} & Omit<PriceProps, 'children'>

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
