import React, { FunctionComponent, useContext, Fragment } from 'react'
import LineItemOptionChildrenContext from '../context/LineItemOptionChildrenContext'
import _ from 'lodash'
import Parent from './utils/Parent'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.LineItemOption.propTypes
const displayName = components.LineItemOption.displayName

export type LineItemOptionProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const LineItemOption: FunctionComponent<LineItemOptionProps> = (props) => {
  const {
    name,
    children,
    keyClassName,
    keyId,
    keyStyle,
    valueClassName,
    id,
    style,
    ...p
  } = props
  const { lineItemOption } = useContext(LineItemOptionChildrenContext)
  const parentProps = {
    ...props,
    lineItemOption,
  }
  return children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : _.has(lineItemOption, `options.${name}`) ? (
    <Fragment>
      <span
        id={keyId as string}
        style={keyStyle as object}
        className={keyClassName as string}
        {...p}
      >
        {`${name}:`}
      </span>
      <span id={id} style={style} className={valueClassName as string} {...p}>
        {`${lineItemOption['options'][name]}`}
      </span>
    </Fragment>
  ) : null
}

LineItemOption.propTypes = propTypes
LineItemOption.displayName = displayName

export default LineItemOption
