import type { LineItemOption as LineItemOptionType } from "@commercelayer/sdk"
import { type CSSProperties, type ElementType, type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import LineItemOptionChildrenContext from "#context/LineItemOptionChildrenContext"
import type { ChildrenFunction } from "#typings/index"

export interface TLineItemOption extends Omit<Props, "children"> {
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
    tagElement = "li",
    tagContainer = "ul",
    ...p
  } = props
  const { lineItemOption, showAll } = useContext(LineItemOptionChildrenContext)
  const parentProps = {
    ...props,
    lineItemOption,
  }
  const TagElement: ElementType = tagElement
  const TagContainer: ElementType = tagContainer
  const optionEntries = Object.entries(lineItemOption?.options ?? {})
  const label = name != null ? lineItemOption?.options?.[name] : ""
  const components = showAll ? (
    optionEntries.map(([key, value]) => {
      return (
        <TagElement key={key} {...p}>
          {`${key}:`}
          <span className={valueClassName}>{`${value as string}`}</span>
        </TagElement>
      )
    })
  ) : name != null && lineItemOption?.options != null && name in lineItemOption.options ? (
    <TagElement key={key} {...p}>
      {`${name}:`}
      <span className={valueClassName} {...p}>
        {label ?? ""}
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
