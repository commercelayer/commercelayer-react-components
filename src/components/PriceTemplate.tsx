import React, { Fragment, FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { BC } from '../@types'
import { PPropsType } from './Price'

export const PriceTemplateProps = {
  ...BC,
  formattedAmount: PropTypes.string,
  formattedCompare: PropTypes.string,
  loading: PropTypes.bool,
  loader: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
}

export type PTemplateProps = InferProps<typeof PriceTemplateProps> & PPropsType

const PriceTemplate: FunctionComponent<PTemplateProps> = props =>
  props.loading ? (
    <Fragment>{props.loader || 'Loading...'}</Fragment>
  ) : (
    <Fragment>
      <span className={props.className}>{props.formattedAmount}</span>
      {props.showCompare && (
        <span className={props.compareClassName}>{props.formattedCompare}</span>
      )}
    </Fragment>
  )

PriceTemplate.propTypes = PriceTemplateProps

PriceTemplate.defaultProps = {
  formattedAmount: '',
  formattedCompare: ''
}

export default PriceTemplate
