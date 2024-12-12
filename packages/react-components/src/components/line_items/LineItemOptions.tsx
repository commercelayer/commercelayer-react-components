import { useContext, type ReactNode, type JSX } from 'react';
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemOptionChildrenContext, {
  type TLineItemOptions
} from '#context/LineItemOptionChildrenContext'

type Props = {
  children: ReactNode
  title?: string
  showName?: boolean
  titleTagElement?: keyof JSX.IntrinsicElements
  titleClassName?: string
} & Omit<JSX.IntrinsicElements['div'], 'children'> &
  (
    | {
        skuOptionId: string
        showAll?: never
      }
    | {
        skuOptionId?: never
        showAll: true
      }
  )

export function LineItemOptions(props: Props): JSX.Element {
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
  const lineItemOptions =
    lineItem != null ? lineItem?.line_item_options || [] : []
  const TitleTagElement = titleTagElement as any
  const options = lineItemOptions
    .filter((o) => {
      if (showAll) return true
      // @ts-expect-error no type
      return o.skuOption().id === skuOptionId
    })
    .map((o, k) => {
      const showTitle = showName ? (
        <TitleTagElement className={titleClassName}>
          {title || o.name}
        </TitleTagElement>
      ) : null
      const valueProps = {
        lineItemOption: o as TLineItemOptions,
        showAll
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

export default LineItemOptions
