import { useContext, ReactNode } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemOptionChildrenContext from '#context/LineItemOptionChildrenContext'
import { isEmpty } from 'lodash'
import components from '#config/components'
import { LineItemOption } from '@commercelayer/sdk'

const displayName = components.LineItemOptions.displayName

export type LineItemOptionsProps = JSX.IntrinsicElements['div'] & {
  children: ReactNode
  title?: string
  showName?: boolean
  titleTagElement?: keyof JSX.IntrinsicElements
  titleClassName?: string
} & (
    | {
        skuOptionId: string
        showAll?: never
      }
    | {
        skuOptionId?: never
        showAll: true
      }
  )

const LineItemOptions: React.FunctionComponent<LineItemOptionsProps> = (
  props
) => {
  const {
    skuOptionId,
    title,
    children,
    showName = true,
    showAll,
    className,
    titleTagElement = 'h6',
    titleClassName,
    ...p
  } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const lineItemOptions: LineItemOption[] = !isEmpty(lineItem)
    ? lineItem?.['line_item_options'] || []
    : []
  const TitleTagElement = titleTagElement as any
  const options = lineItemOptions
    .filter((o) => {
      if (showAll) return true
      // @ts-ignore
      return o.skuOption().id === skuOptionId
    })
    .map((o, k) => {
      const showTitle = showName ? (
        <TitleTagElement className={titleClassName}>
          {title || o.name}
        </TitleTagElement>
      ) : null
      const valueProps = {
        lineItemOption: o,
        showAll,
      }
      return (
        <div className={className} key={k} {...p}>
          {showTitle}
          <LineItemOptionChildrenContext.Provider value={valueProps}>
            {children}
          </LineItemOptionChildrenContext.Provider>
        </div>
      )
    })
  return <>{options}</>
}

LineItemOptions.displayName = displayName

export default LineItemOptions
