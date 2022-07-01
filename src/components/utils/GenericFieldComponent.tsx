import { InitialSkuContext } from '#context/SkuChildrenContext'
import { InitialStockTransferContext } from '#context/StockTransferChildrenContext'
import type { Customer, LineItem, Sku } from '@commercelayer/sdk'
import Parent from './Parent'
import { InitialLineItemContext } from '#context/LineItemChildrenContext'
import { Context, useContext } from 'react'
import { defaultImgUrl } from '#utils/placeholderImages'
import { InitialCustomerContext } from '#context/CustomerContext'

export type TResources = {
  StockTransfer: LineItem & { resource: 'stock_transfers' }
  Sku: Sku & { resource: 'skus' }
  LineItem: LineItem & { resource: 'line_items' }
  Customer: Customer & { resource: 'customers' }
}

export type TResourceKey = {
  [K in keyof TResources]: K
}

export type TGenericChildrenProps<E extends TResources[keyof TResources]> =
  Omit<Props<E>, 'children' | 'attribute' | 'context' | 'tagElement'> & {
    attributeValue: E[keyof E]
  }

type ResourceContext = {
  stock_transfers: InitialStockTransferContext
  skus: InitialSkuContext
  line_items: InitialLineItemContext
  customers: InitialCustomerContext
}

type GenericContext<K extends keyof ResourceContext> = Context<
  ResourceContext[K]
>

type Props<E extends TResources[keyof TResources]> = {
  children?: (props: TGenericChildrenProps<E>) => JSX.Element
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
  let attributeValue = ''
  const keysContext = Object.keys(resourceContext).filter(
    (key) => key === p['resource']
  ) as [keyof ResourceContext[keyof ResourceContext]]
  if (keysContext.length === 1) {
    const [keyResource] = keysContext
    if (keyResource && attribute) {
      attributeValue = resourceContext[keyResource][attribute]
    }
  }
  const Tag = tagElement || 'span'
  if (Tag === 'img' && !children) {
    const src = attributeValue || defaultImgUrl
    const name = ''
    return <img alt={name} src={src} {...(p as JSX.IntrinsicElements['img'])} />
  }
  const parentProps = {
    attributeValue,
    tagElement,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Tag {...p}>{attributeValue}</Tag>
  )
}
