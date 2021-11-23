import React, { FunctionComponent, useContext, CSSProperties } from 'react'
import LineItemOptionChildrenContext from '#context/LineItemOptionChildrenContext'
import get from 'lodash/get'
import has from 'lodash/has'
import map from 'lodash/map'
import Parent from './utils/Parent'
import components from '#config/components'
import { LineItemOption as LineItemOptionType } from '@commercelayer/sdk'
import { FunctionChildren } from '#typings/index'
import isJSON from '#utils/isJSON'

const propTypes = components.LineItemOption.propTypes
const displayName = components.LineItemOption.displayName

type LineItemOptionChildrenProps = FunctionChildren<
  Omit<LineItemOptionProps, 'children'> & {
    lineItemOption: LineItemOptionType
  }
>

type LineItemOptionProps = {
  id?: string
  className?: string
  key?: string
  style?: CSSProperties
  children?: LineItemOptionChildrenProps
  name?: string
  valueClassName?: string
  tagElement?: keyof JSX.IntrinsicElements
  tagContainer?: keyof JSX.IntrinsicElements
}

const LineItemOption: FunctionComponent<LineItemOptionProps> = (props) => {
  const {
    name,
    children,
    valueClassName,
    id,
    key,
    tagElement = 'li',
    tagContainer = 'ul',
    ...p
  } = props
  const { lineItemOption, showAll } = useContext(LineItemOptionChildrenContext)
  const parentProps = {
    ...props,
    lineItemOption,
  }
  const TagElement = tagElement as any
  const TagContainer = tagContainer
  const components =
    showAll && isJSON(JSON.stringify(lineItemOption?.options)) ? (
      map(lineItemOption?.options, (value, key) => {
        return (
          <TagElement key={key} {...p}>
            {`${key}:`}
            <span className={valueClassName}>{`${value}`}</span>
          </TagElement>
        )
      })
    ) : has(lineItemOption, `options.${name}`) ? (
      <TagElement key={key} {...p}>
        {`${name}:`}
        <span className={valueClassName} {...p}>
          {`${get(lineItemOption, `options.${name}`)}`}
        </span>
      </TagElement>
    ) : null
  return children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <TagContainer>{components}</TagContainer>
  )
}

LineItemOption.propTypes = propTypes
LineItemOption.displayName = displayName

export default LineItemOption
