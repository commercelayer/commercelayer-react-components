import React, { Fragment, FunctionComponent } from 'react'
import { PriceProps } from '#components/Price'
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
  const {
    showCompare,
    formattedCompare,
    compareClassName,
    className,
    formattedAmount,
    skuCode,
    ...p
  } = props
  return (
    <Fragment>
      <span className={className} {...p}>
        {formattedAmount}
      </span>
      {showCompare && (
        <span className={compareClassName || ''} {...p}>
          {formattedCompare}
        </span>
      )}
    </Fragment>
  )
}

PriceTemplate.propTypes = propTypes
PriceTemplate.defaultProps = defaultProps

export default PriceTemplate
