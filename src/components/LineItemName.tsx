import React, { useContext, FunctionComponent } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types'
import { LineItemCollection } from '@commercelayer/js-sdk'

export interface LineItemImageProps extends BaseComponent {
  lineItem?: LineItemCollection
  children?: FunctionComponent
}

const LineItemName: FunctionComponent<LineItemImageProps> = props => {
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

export default LineItemName
