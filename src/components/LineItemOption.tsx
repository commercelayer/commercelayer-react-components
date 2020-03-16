import React, { FunctionComponent, useContext, Fragment } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { BC } from '../@types'
import LineItemOptionChildrenContext from '../context/LineItemOptionChildrenContext'
import _ from 'lodash'
import Parent from './utils/Parent'

const LIOProps = {
  ...BC,
  name: PropTypes.string.isRequired,
  children: PropTypes.func,
  optionKeyClassName: PropTypes.string,
  optionKeyId: PropTypes.string,
  optionKeyStyle: PropTypes.object
}

export type LineItemOptionProps = InferProps<typeof LIOProps>

const LineItemOption: FunctionComponent<LineItemOptionProps> = props => {
  const {
    name,
    children,
    optionKeyClassName,
    optionKeyId,
    optionKeyStyle,
    className,
    id,
    style,
    ...p
  } = props
  const { lineItemOption } = useContext(LineItemOptionChildrenContext)
  const parentProps = {
    ...props,
    lineItemOption
  }
  return children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : _.has(lineItemOption, `options.${name}`) ? (
    <Fragment>
      <span
        id={optionKeyId}
        style={optionKeyStyle}
        className={optionKeyClassName}
        {...p}
      >{`${name}:`}</span>
      <span
        id={id}
        style={style}
        className={className}
        {...p}
      >{`${lineItemOption.options[name]}`}</span>
    </Fragment>
  ) : null
}

LineItemOption.propTypes = LIOProps

export default LineItemOption
