import React, { useContext, FunctionComponent } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types'
import PropTypes, { InferProps } from 'prop-types'

const LINProps = {
  children: PropTypes.func
}

export type LineItemNameProps = InferProps<typeof LINProps> & BaseComponent

const LineItemName: FunctionComponent<LineItemNameProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const parentProps = {
    name: lineItem?.name,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{lineItem?.name}</p>
  )
}

LineItemName.propTypes = LINProps

export default LineItemName
