import React, { useContext, FunctionComponent, Fragment } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemOptionChildrenContext from '../context/LineItemOptionChildrenContext'
import _ from 'lodash'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

const propTypes = components.LineItemOptions.propTypes
const defaultProps = components.LineItemOptions.defaultProps
const displayName = components.LineItemOptions.displayName

export type LineItemOptionsProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const LineItemOptions: FunctionComponent<LineItemOptionsProps> = (props) => {
  const { name, children, showName, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const lineItemOptions = !_.isEmpty(lineItem)
    ? lineItem['lineItemOptions']().toArray()
    : []
  const options = lineItemOptions
    .filter((o) => o.name === name)
    .map((o, k) => {
      const title = showName ? <span {...p}>{name}</span> : null
      const valueProps = {
        lineItemOption: o,
      }
      return (
        <Fragment key={k}>
          {title}
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
