import { InitialSkuContext } from '#context/SkuChildrenContext'
import { InitialStockTransferContext } from '#context/StockTransferChildrenContext'
import type {
  Customer,
  LineItem,
  Sku,
  Parcel,
  ParcelLineItem
} from '@commercelayer/sdk'
import Parent from './Parent'
import { InitialLineItemContext } from '#context/LineItemChildrenContext'
import { Context, useContext } from 'react'
import { defaultImgUrl } from '#utils/placeholderImages'
import { InitialCustomerContext } from '#context/CustomerContext'
import { InitialParcelContext } from '#context/ParcelChildrenContext'
import { InitialParcelLineItemContext } from '#context/ParcelLineItemChildrenContext'

export interface TResources {
  StockTransfer: LineItem & { resource: 'stock_transfers' }
  Sku: Sku & { resource: 'sku' }
  LineItem: LineItem & { resource: 'lineItem' }
  Customer: Customer & { resource: 'customers' }
  Parcel: Parcel & { resource: 'parcel' }
  ParcelLineItem: Pick<
    ParcelLineItem,
    // @ts-expect-error
    'quantity' | 'sku_code' | 'name' | 'image_url'
  > & {
    resource: 'parcelLineItem'
  }
}

export type TResourceKey = {
  [K in keyof TResources]: K
}

export type TGenericChildrenProps<E extends TResources[keyof TResources]> =
  Omit<Props<E>, 'children' | 'attribute' | 'context' | 'tagElement'> & {
    attributeValue: E[keyof E]
  }

interface ResourceContext {
  stock_transfers: InitialStockTransferContext
  sku: InitialSkuContext
  lineItem: InitialLineItemContext
  customers: InitialCustomerContext
  parcel: InitialParcelContext
  parcelLineItem: InitialParcelLineItemContext
}

type GenericContext<K extends keyof ResourceContext> = Context<
  ResourceContext[K]
>

interface Props<E extends TResources[keyof TResources]> {
  children?: (props: TGenericChildrenProps<E>) => JSX.Element
  resource: E['resource']
  attribute: keyof E
  tagElement: keyof JSX.IntrinsicElements
  context: GenericContext<E['resource']>
}

export default function GenericFieldComponent<R extends keyof TResources>(
  props: Props<TResources[R]>
): JSX.Element {
  const { children, tagElement, attribute, context, ...p } = props
  const resourceContext = useContext(context)
  let attributeValue = ''
  const keysContext = Object.keys(resourceContext).filter(
    (key) => key === p.resource
  ) as [keyof ResourceContext[keyof ResourceContext]]
  console.log('keys', Object.keys(resourceContext))
  console.log('p.resource', p.resource)
  console.log('keyContext', keysContext)
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
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Tag {...p}>{attributeValue}</Tag>
  )
}
