import React, { useContext, FunctionComponent, Fragment } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types'
import PropTypes, { InferProps } from 'prop-types'
import _ from 'lodash'

const LIOptionsProps = {
  children: PropTypes.func
}

export type LineItemOptionsProps = InferProps<typeof LIOptionsProps> &
  BaseComponent

const LineItemOptions: FunctionComponent<LineItemOptionsProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const lineItemOptions = lineItem.lineItemOptions().toArray()
  const parentProps = {
    lineItemOptions,
    ...props
  }
  const options = lineItemOptions.map((o, k) => {
    const name = o.name
    const opts = _.map(o.options, (v, k) => {
      return (
        <p key={k} {...props}>
          <span>{`${name}: `}</span>
          <span>{`${v}`}</span>
        </p>
      )
    })
    return <Fragment key={k}>{opts}</Fragment>
  })
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <Fragment>{options}</Fragment>
  )
}

LineItemOptions.propTypes = LIOptionsProps

export default LineItemOptions
