import { InitialSkuContext } from '#context/SkuChildrenContext'
import { InitialStockTransferContext } from '#context/StockTransferChildrenContext'
import { LineItem, Sku } from '@commercelayer/sdk'
import Parent from './Parent'
import { InitialLineItemContext } from '#context/LineItemChildrenContext'
import { Context, useContext } from 'react'
import { defaultImgUrl } from '#utils/placeholderImages'

export type TResources = {
  StockTransfer: LineItem & { resource: 'stock_transfers' }
  Sku: Sku & { resource: 'skus' }
  LineItem: LineItem & { resource: 'line_items' }
}

export type TResourceKey = {
  [K in keyof TResources]: K
}

type ChildrenProps<E extends TResources[keyof TResources]> = Omit<
  Props<E>,
  'children' | 'attribute'
> & {
  element: E[keyof E]
}

type ResourceContext = {
  stock_transfers: InitialStockTransferContext
  skus: InitialSkuContext
  line_items: InitialLineItemContext
}

type GenericContext<K extends keyof ResourceContext> = Context<
  ResourceContext[K]
>

type Props<E extends TResources[keyof TResources]> = {
  children?: (props: ChildrenProps<E>) => JSX.Element
  resource: E['resource']
  attribute: keyof E
  tagElement: keyof JSX.IntrinsicElements
  context: GenericContext<E['resource']>
}

export default function GenericFieldComponent<R extends keyof TResources>(
  props: Props<TResources[R]>
) {
  const { children, tagElement, attribute, context, ...p } = props
  const resourceContext = useContext(context)
  let element
  for (const key in resourceContext) {
    if (Object.prototype.hasOwnProperty.call(resourceContext, key)) {
      const dataContext = resourceContext[key] as any
      element = dataContext[attribute]
    }
  }
  const Tag = tagElement || 'span'
  if (Tag === 'img' && !children) {
    const src = element || defaultImgUrl
    const name = ''
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
    <Tag {...p}>{element}</Tag>
  )
}
