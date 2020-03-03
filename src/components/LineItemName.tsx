import React, { useContext, FunctionComponent } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types'
import PropTypes from 'prop-types'

export interface LineItemNameProps extends BaseComponent {
  children?: FunctionComponent
}

const LineItemName: FunctionComponent<LineItemNameProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const parentProps = {
    name: lineItem.name,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{lineItem.name}</p>
  )
}

LineItemName.propTypes = {
  children: PropTypes.func
}

export default LineItemName
