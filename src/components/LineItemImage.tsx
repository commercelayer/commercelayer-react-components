import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

const propTypes = components.LineItemImage.propTypes
const displayName = components.LineItemImage.displayName

export type LineItemImageProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['img']

const LineItemImage: FunctionComponent<LineItemImageProps> = (props) => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const src = props.src || lineItem['imageUrl']
  const parenProps = {
    src,
    ...props,
  }
  return props.children ? (
    <Parent {...parenProps}>{props.children}</Parent>
  ) : (
    <img src={src} {...props} />
  )
}

LineItemImage.propTypes = propTypes
LineItemImage.displayName = displayName

export default LineItemImage
