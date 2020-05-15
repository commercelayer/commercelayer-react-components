import React, {
  useContext,
  FunctionComponent,
  Fragment,
  ReactNode,
} from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemOptionChildrenContext from '../context/LineItemOptionChildrenContext'
import _ from 'lodash'
import components from '../config/components'
import { LineItemOptionCollection } from '@commercelayer/js-sdk'

const propTypes = components.LineItemOptions.propTypes
const defaultProps = components.LineItemOptions.defaultProps
const displayName = components.LineItemOptions.displayName

export type LineItemOptionsProps = {
  children: ReactNode
  skuOptionId: string
  title?: string
  showName?: boolean
} & JSX.IntrinsicElements['span']

const LineItemOptions: FunctionComponent<LineItemOptionsProps> = (props) => {
  const { skuOptionId, title, children, showName = true, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const lineItemOptions: LineItemOptionCollection[] = !_.isEmpty(lineItem)
    ? lineItem['lineItemOptions']().toArray()
    : []
  const options = lineItemOptions
    .filter((o) => {
      // @ts-ignore
      return o.skuOption().id === skuOptionId
    })
    .map((o, k) => {
      const showTitle = showName ? <span {...p}>{title || o.name}</span> : null
      const valueProps = {
        lineItemOption: o,
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

LineItemOptions.propTypes = propTypes
LineItemOptions.defaultProps = defaultProps
LineItemOptions.displayName = displayName

export default LineItemOptions
