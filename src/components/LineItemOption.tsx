import React, {
  FunctionComponent,
  useContext,
  Fragment,
  CSSProperties,
} from 'react'
import LineItemOptionChildrenContext from '#context/LineItemOptionChildrenContext'
import get from 'lodash/get'
import has from 'lodash/has'
import map from 'lodash/map'
import Parent from './utils/Parent'
import components from '#config/components'
import { LineItemOptionCollection } from '@commercelayer/js-sdk'
import { FunctionChildren } from '#typings/index'

const propTypes = components.LineItemOption.propTypes
const displayName = components.LineItemOption.displayName

type LineItemOptionChildrenProps = FunctionChildren<
  Omit<LineItemOptionProps, 'children'> & {
    lineItemOption: LineItemOptionCollection
  }
>

type LineItemOptionProps = {
  children?: LineItemOptionChildrenProps
  name?: string
  valueClassName?: string
  keyClassName?: string
  keyId?: string
  keyStyle?: CSSProperties
} & JSX.IntrinsicElements['span']

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
  const { lineItemOption, showAll } = useContext(LineItemOptionChildrenContext)
  const parentProps = {
    ...props,
    lineItemOption,
  }

  const components = showAll ? (
    map(lineItemOption?.options, (value, key) => {
      return (
        <Fragment>
          <span id={keyId} style={keyStyle} className={keyClassName} {...p}>
            {`${key}:`}
          </span>
          <span id={id} style={style} className={valueClassName} {...p}>
            {`${value}`}
          </span>
        </Fragment>
      )
    })
  ) : has(lineItemOption, `options.${name}`) ? (
    <Fragment>
      <span id={keyId} style={keyStyle} className={keyClassName} {...p}>
        {`${name}:`}
      </span>
      <span id={id} style={style} className={valueClassName} {...p}>
        {`${get(lineItemOption, `options.${name}`)}`}
      </span>
    </Fragment>
  ) : null
  return children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <>{components}</>
  )
}

LineItemOption.propTypes = propTypes
LineItemOption.displayName = displayName

export default LineItemOption
