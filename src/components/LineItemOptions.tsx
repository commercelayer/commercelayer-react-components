import React, { useContext, FunctionComponent, Fragment } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import { BaseComponent } from '../@types'
import PropTypes, { InferProps } from 'prop-types'
import LineItemOptionChildrenContext from '../context/LineItemOptionChildrenContext'

const LIOptionsProps = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  showName: PropTypes.bool
}

export type LineItemOptionsProps = BaseComponent &
  InferProps<typeof LIOptionsProps>

const LineItemOptions: FunctionComponent<LineItemOptionsProps> = props => {
  const { name, children, showName, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const lineItemOptions = lineItem ? lineItem.lineItemOptions().toArray() : []
  const options = lineItemOptions
    .filter(o => o.name === name)
    .map((o, k) => {
      const title = showName ? <span {...p}>{name}</span> : null
      const valueProps = {
        lineItemOption: o
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

LineItemOptions.propTypes = LIOptionsProps

LineItemOptions.defaultProps = {
  showName: true
}

export default LineItemOptions
