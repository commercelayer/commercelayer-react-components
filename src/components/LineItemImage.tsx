import React, { FunctionComponent, useContext, ReactNode } from 'react'
import Parent from './utils/Parent'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import components from '#config/components'
import { LineItem } from '@commercelayer/sdk'
import { LineItemType } from '#typings'

const defaultImgUrl =
  'https://data.commercelayer.app/assets/images/placeholders/img_placeholder.svg'
const defaultGiftCardImgUrl =
  'https://data.commercelayer.app/assets/images/placeholders/gift_placeholder.svg'

const propTypes = components.LineItemImage.propTypes
const displayName = components.LineItemImage.displayName

export type LineItemImageType = Omit<LineItemImageProps, 'children'> & {
  src: string
  lineItem: LineItem
}

type LineItemImageProps = {
  children?: (props: LineItemImageType) => ReactNode
  width?: number
  placeholder?: {
    [K in LineItemType]?: string
  }
} & Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'placeholder'>

const LineItemImage: FunctionComponent<LineItemImageProps> = (props) => {
  const { placeholder, children, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const itemType = lineItem?.item_type as LineItemType
  let src = lineItem?.image_url
  if (!src) {
    if (placeholder?.[itemType]) {
      src = placeholder?.[itemType]
    } else {
      src = itemType === 'gift_cards' ? defaultGiftCardImgUrl : defaultImgUrl
    }
  }
  const parenProps = {
    lineItem,
    src,
    placeholder,
    ...p,
  }
  return children ? (
    <Parent {...parenProps}>{children}</Parent>
  ) : !src ? null : (
    <img alt="" src={src} {...p} />
  )
}

LineItemImage.propTypes = propTypes
LineItemImage.displayName = displayName

export default LineItemImage
