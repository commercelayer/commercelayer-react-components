import React, { useContext, FunctionComponent } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types'

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

// TODO add propTypes

export default LineItemName
