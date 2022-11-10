import { useContext, CSSProperties } from 'react'
import LineItemOptionChildrenContext from '#context/LineItemOptionChildrenContext'
import get from 'lodash/get'
import has from 'lodash/has'
import map from 'lodash/map'
import Parent from '#components/utils/Parent'
import { LineItemOption as LineItemOptionType } from '@commercelayer/sdk'
import { ChildrenFunction } from '#typings/index'
import isJSON from '#utils/isJSON'

export interface TLineItemOption extends Omit<Props, 'children'> {
  lineItemOption: LineItemOptionType
}

interface Props {
  id?: string
  className?: string
  key?: string
  style?: CSSProperties
  children?: ChildrenFunction<TLineItemOption>
  name?: string
  valueClassName?: string
  tagElement?: keyof JSX.IntrinsicElements
  tagContainer?: keyof JSX.IntrinsicElements
}

export function LineItemOption(props: Props): JSX.Element {
  const {
    name,
    children,
    valueClassName,
    key,
    tagElement = 'li',
    tagContainer = 'ul',
    ...p
  } = props
  const { lineItemOption, showAll } = useContext(LineItemOptionChildrenContext)
  const parentProps = {
    ...props,
    lineItemOption
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

export default LineItemOption
