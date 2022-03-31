import { Sku } from '@commercelayer/sdk'
import SkuChildrenContext from '#context/SkuChildrenContext'
import { useContext } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'

type ExcludeTag<T extends keyof JSX.IntrinsicElements> = Exclude<
  keyof JSX.IntrinsicElements,
  T
>

type Conditional =
  | ({
      attribute: 'image_url'
      tagElement: 'img'
    } & JSX.IntrinsicElements['img'])
  | ({
      attribute: Exclude<keyof Sku, 'image_url'>
      tagElement: ExcludeTag<'img'>
    } & JSX.IntrinsicElements[ExcludeTag<'img'>])

type ChildrenProps = Omit<Props, 'children' | 'attribute'> & {
  element: Sku[keyof Sku]
}

type Props = {
  children?: (props: ChildrenProps) => JSX.Element
} & Conditional

export default function SkuField<P extends Props>({
  attribute,
  tagElement,
  children,
  ...p
}: P): JSX.Element {
  const { sku } = useContext(SkuChildrenContext)
  const element = (sku && sku[attribute]) || ''
  const Tag = tagElement
  if (Tag === 'img') {
    const src = element as string
    const name = sku?.name
    return <img alt={name} src={src} {...(p as JSX.IntrinsicElements['img'])} />
  }
  const parentProps = {
    element,
    tagElement,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Tag>{element}</Tag>
  )
}

SkuField.propTypes = components.SkuField.propTypes
