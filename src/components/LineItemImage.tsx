import React, { FunctionComponent, useContext, ReactNode } from 'react'
import Parent from './utils/Parent'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import components from '#config/components'
import { LineItem } from '@commercelayer/sdk'

const propTypes = components.LineItemImage.propTypes
const displayName = components.LineItemImage.displayName

export type LineItemImageType = Omit<LineItemImageProps, 'children'> & {
  src: string
  lineItem: LineItem
}

type LineItemImageProps = {
  children?: (props: LineItemImageType) => ReactNode
  width?: number
} & Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet'>

const LineItemImage: FunctionComponent<LineItemImageProps> = (props) => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const src = lineItem?.image_url
  const parenProps = {
    lineItem,
    src,
    ...props,
  }
  return props.children ? (
    <Parent {...parenProps}>{props.children}</Parent>
  ) : (
    <img alt="" src={src} {...props} />
  )
}

LineItemImage.propTypes = propTypes
LineItemImage.displayName = displayName

export default LineItemImage
