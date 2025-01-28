import type { InitialSkuContext } from '#context/SkuChildrenContext'
import type { InitialStockTransferContext } from '#context/StockTransferChildrenContext'
import type {
  Customer,
  LineItem,
  Sku,
  Parcel,
  ParcelLineItem
} from '@commercelayer/sdk'
import Parent from './Parent'
import type { InitialLineItemChildrenContext } from '#context/LineItemChildrenContext'
import { type Context, useContext, type JSX } from 'react';
import { defaultImgUrl } from '#utils/placeholderImages'
import type { InitialCustomerContext } from '#context/CustomerContext'
import type { InitialParcelContext } from '#context/ParcelChildrenContext'
import type { InitialParcelLineItemContext } from '#context/ParcelLineItemChildrenContext'

export interface TResources {
  StockTransfer: LineItem & { resource: 'stockTransfer' }
  Sku: Sku & { resource: 'sku' }
  LineItem: LineItem & { resource: 'lineItem' }
  Customer: Customer & { resource: 'customers' }
  Parcel: Parcel & { resource: 'parcel' }
  ParcelLineItem: Pick<
    ParcelLineItem,
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
  stockTransfer: InitialStockTransferContext
  sku: InitialSkuContext
  lineItem: InitialLineItemChildrenContext
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
  /**
   * Resource attribute to display.
   */
  attribute: keyof E
  /**
   * Html tag to render. When tag is `img` the value will be used to fill the `src` attribute.
   */
  tagElement: keyof JSX.IntrinsicElements
  context: GenericContext<E['resource']>
}

export default function GenericFieldComponent<R extends keyof TResources>(
  props: Props<TResources[R]>
): JSX.Element {
  const { children, tagElement, attribute, context, resource, ...p } = props
  const resourceContext = useContext(context)
  let attributeValue = ''
  const keysContext = Object.keys(resourceContext).filter(
    (key) => key === resource
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
    return <img alt={name} src={src} {...(p as Omit<JSX.IntrinsicElements['img'], 'ref' | 'children'>)} />
  }
  const parentProps = {
    attributeValue,
    tagElement,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Tag key={attributeValue} data-testid={attributeValue} {...p}>
      {attributeValue}
    </Tag>
  )
}
