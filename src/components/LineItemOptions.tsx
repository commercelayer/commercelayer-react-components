import React, {
  useContext,
  FunctionComponent,
  Fragment,
  ReactNode,
} from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import LineItemOptionChildrenContext from '#context/LineItemOptionChildrenContext'
import { isEmpty } from 'lodash'
import components from '#config/components'
import { LineItemOptionCollection } from '@commercelayer/js-sdk'

const displayName = components.LineItemOptions.displayName

export type LineItemOptionsProps = JSX.IntrinsicElements['span'] & {
  children: ReactNode
  title?: string
  showName?: boolean
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

const LineItemOptions: FunctionComponent<LineItemOptionsProps> = (props) => {
  const { skuOptionId, title, children, showName = true, showAll, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const lineItemOptions: LineItemOptionCollection[] = !isEmpty(lineItem)
    ? lineItem['line_item_options']
    : []
  const options = lineItemOptions
    .filter((o) => {
      if (showAll) return true
      // @ts-ignore
      return o.skuOption().id === skuOptionId
    })
    .map((o, k) => {
      const showTitle = showName ? <span {...p}>{title || o.name}</span> : null
      const valueProps = {
        lineItemOption: o,
        showAll,
      }
      return (
        <Fragment key={k}>
          {showTitle}
          <LineItemOptionChildrenContext.Provider value={valueProps}>
            {children}
          </LineItemOptionChildrenContext.Provider>
        </Fragment>
      )
    })
  return <Fragment>{options}</Fragment>
}

LineItemOptions.displayName = displayName

export default LineItemOptions
