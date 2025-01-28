import { useContext, type JSX } from 'react';
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import type { LineItem } from '@commercelayer/sdk'
import type { ChildrenFunction } from '#typings'
import { defaultGiftCardImgUrl, defaultImgUrl } from '#utils/placeholderImages'
import Parent from '#components/utils/Parent'
import type { TLineItem } from './LineItem'

export interface TLineItemImage extends Omit<Props, 'children'> {
  src: string
  lineItem: LineItem
}

type Props = {
  children?: ChildrenFunction<TLineItemImage>
  width?: number
  placeholder?: {
    [K in TLineItem]?: string
  }
} & Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'placeholder'>

export function LineItemImage(props: Props): JSX.Element | null {
  const { placeholder, children, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const itemType = lineItem?.item_type as TLineItem
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
    ...p
  }
  return children ? (
    <Parent {...parenProps}>{children}</Parent>
  ) : !src ? null : (
    <img
      data-testid={`line-item-image-${lineItem?.sku_code ?? ''}`}
      alt={lineItem?.name ?? ''}
      src={src}
      {...p}
    />
  )
}

export default LineItemImage
