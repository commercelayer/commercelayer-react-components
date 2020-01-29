import React, { FunctionComponent, useContext } from 'react'
import { GeneralComponent } from '../@types/index'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import Parent from './utils/Parent'
import LineItemChildrenContext from './context/LineItemChildrenContext'

export interface LineItemImageProps extends GeneralComponent {
  width?: number
  src?: string
  lineItem?: LineItemCollection
  children?: FunctionComponent
}

const LineItemImage: FunctionComponent<LineItemImageProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const src = props.src || lineItem.imageUrl
  const parenProps = {
    src,
    ...props
  }
  return props.children ? (
    <Parent {...parenProps}>{props.children}</Parent>
  ) : (
    <img src={src} {...props} />
  )
}
export default LineItemImage
