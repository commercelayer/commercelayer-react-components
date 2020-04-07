import React, { Fragment, FunctionComponent } from 'react'
import { PPropsType } from './Price'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

const propTypes = components.PriceTemplate.propTypes
const defaultProps = components.PriceTemplate.defaultProps
const displayName = components.PriceTemplate.displayName

export type PTemplateProps = PropsType<typeof propTypes> &
  PPropsType &
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
PriceTemplate.displayName = displayName

export default PriceTemplate
