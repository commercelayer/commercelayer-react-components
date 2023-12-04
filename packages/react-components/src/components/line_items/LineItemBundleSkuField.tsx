import { useContext } from 'react'
import Parent from '#components/utils/Parent'
import type { LineItem, Sku, SkuListItem } from '@commercelayer/sdk'
import { type ChildrenFunction } from '#typings/index'
import LineItemBundleSkuChildrenContext from '#context/LineItemBundleSkuChildrenContext'

type SkuAttribute = Extract<
  keyof Sku,
  | 'code'
  | 'image_url'
  | 'description'
  | 'name'
  | 'pieces_per_pack'
  | 'weight'
  | 'unit_of_weight'
>
type SkuListItemAttribute = Extract<keyof SkuListItem, 'quantity'>
type Attribute = SkuListItemAttribute | SkuAttribute
type TagElementKey = Extract<
  keyof JSX.IntrinsicElements,
  'p' | 'span' | 'div' | 'img'
>

export interface TLineItemBundleSkuField extends Omit<Props, 'children'> {
  lineItem: LineItem
  skuListItem: SkuListItem
}

type ImageElement = Omit<
  JSX.IntrinsicElements[Extract<TagElementKey, 'img'>],
  'children' | 'ref'
>

type OtherElements = Omit<
  JSX.IntrinsicElements[Exclude<TagElementKey, 'img'>],
  'children' | 'ref'
>

type Props = {
  children?: ChildrenFunction<TLineItemBundleSkuField>
} & (
  | ({
      attribute: 'image_url'
      tagElement: 'img'
    } & ImageElement)
  | ({
      attribute: Exclude<Attribute, 'image_url'>
      tagElement?: Exclude<TagElementKey, 'img'>
    } & OtherElements)
)

export function LineItemBundleSkuField({
  tagElement = 'span',
  attribute,
  children,
  ...props
}: Props): JSX.Element {
  const { skuListItem } = useContext(LineItemBundleSkuChildrenContext)
  const item = skuListItem
  let attr = null
  if (attribute === 'quantity') {
    attr = item?.quantity
  } else {
    attr = item?.sku?.[attribute]
  }
  const TagElement = tagElement
  const parentProps = {
    attribute: attr,
    lineItem: item,
    ...props
  }
  if (attribute === 'image_url' && children == null) {
    return (
      <img
        alt=''
        data-testid={`line-item-bundle-sku-field-image-${item?.sku_code ?? ''}`}
        src={`${attr}` ?? null}
        {...(props as JSX.IntrinsicElements['img'])}
      />
    )
  }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <TagElement
      data-testid={`line-item-bundle-sku-field-${item?.sku_code ?? ''}`}
      {...props}
    >
      {attr}
    </TagElement>
  )
}

export default LineItemBundleSkuField
