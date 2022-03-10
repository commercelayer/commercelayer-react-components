import React from 'react'
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

const PriceTemplate: React.FunctionComponent<PTemplateProps> = (props) => {
  const {
    showCompare,
    formattedCompare,
    compareClassName,
    className,
    formattedAmount,
    ...p
  } = props
  return (
    <>
      <span className={className} {...p}>
        {formattedAmount}
      </span>
      {showCompare && (
        <span className={compareClassName || ''} {...p}>
          {formattedCompare}
        </span>
      )}
    </>
  )
}

PriceTemplate.propTypes = propTypes
PriceTemplate.defaultProps = defaultProps

export default PriceTemplate
