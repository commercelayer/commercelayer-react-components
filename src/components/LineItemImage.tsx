import React, { FunctionComponent, useContext } from 'react'
import { GeneralComponent } from '../@types/index'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import Parent from './utils/Parent'
import LineItemChildrenContext from './context/LineItemChildrenContext'

export interface LineItemImageProps extends GeneralComponent {
  width?: number
  src?: string
  lineItem?: LineItemCollection
}

const LineItemImage: FunctionComponent<LineItemImageProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  return props.children ? (
    <Parent {...props}>{props.children}</Parent>
  ) : (
    <img
      style={props.style}
      className={props.className}
      width={props.width}
      src={props.src ?? lineItem.imageUrl}
    />
  )
}
export default LineItemImage
