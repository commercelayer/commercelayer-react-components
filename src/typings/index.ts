import { Dispatch, ForwardedRef, ReactNode, RefObject } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { BaseError } from './errors'

export const BC = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  name: PropTypes.string,
}

export const PTLoader = PropTypes.oneOfType([
  PropTypes.element,
  PropTypes.string,
])

export const BaseSelectComponentPropTypes = {
  children: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      selected: PropTypes.bool,
    }).isRequired
  ).isRequired,
  placeholder: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  value: PropTypes.string,
  name: PropTypes.string.isRequired,
}

export type SelectPlaceholder = Option

type BaseSelectChildrenComponentProps = Omit<
  BaseSelectComponentProps,
  'children'
>

type Option = {
  label: string
  value: string | number
  disabled?: boolean
}

export interface BaseSelectComponentProps {
  children?: (props: BaseSelectChildrenComponentProps) => ReactNode
  options: Option[]
  placeholder?: Option
  value?: string
  className?: string
  required?: boolean
  name: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const BaseInputComponentPropTypes = {
  children: PropTypes.func,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf<BaseInputType>([
    'text',
    'email',
    'number',
    'date',
    'checkbox',
    'textarea',
  ]).isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
}

type BaseInputChildrenComponentProps = Omit<
  BaseInputComponentProps,
  'children'
> & {
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  parentRef: ForwardedRef<any>
}

export interface BaseInputComponentProps {
  ref?: () => RefObject<any>
  children?: (props: BaseInputChildrenComponentProps) => ReactNode
  name: string
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  placeholder?: string
}

export type LineItemType =
  | 'gift_cards'
  | 'payment_methods'
  | 'promotions'
  | 'shipments'
  | 'skus'
  | 'bundles'
  | 'adjustments'

export type GiftCardInputName =
  | 'balanceCents'
  | 'balanceMaxCents'
  | 'singleUse'
  | 'rechargeable'
  | 'imageUrl'
  | 'expiresAt'
  | 'referenceOrigin'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'reference'

export type AddressInputName =
  | 'billing_address_city'
  | 'billing_address_company'
  | 'billing_address_first_name'
  | 'billing_address_email'
  | 'billing_address_last_name'
  | 'billing_address_line_1'
  | 'billing_address_line_2'
  | 'billing_address_phone'
  | 'billing_address_state_code'
  | 'billing_address_zip_code'
  | 'billing_address_billing_info'
  | 'billing_address_save_to_customer_book'
  | 'customer_address_city'
  | 'customer_address_company'
  | 'customer_address_first_name'
  | 'customer_address_email'
  | 'customer_address_last_name'
  | 'customer_address_line_1'
  | 'customer_address_line_2'
  | 'customer_address_phone'
  | 'customer_address_state_code'
  | 'customer_address_zip_code'
  | 'customer_address_billing_info'
  | 'shipping_address_city'
  | 'shipping_address_company'
  | 'shipping_address_email'
  | 'shipping_address_first_name'
  | 'shipping_address_last_name'
  | 'shipping_address_line_1'
  | 'shipping_address_line_2'
  | 'shipping_address_phone'
  | 'shipping_address_state_code'
  | 'shipping_address_zip_code'
  | 'shipping_address_save_to_customer_book'

export type AddressCountrySelectName =
  | 'billing_address_country_code'
  | 'shipping_address_country_code'

export type AddressStateSelectName =
  | 'billing_address_state_code'
  | 'shipping_address_state_code'

export type BaseInputType =
  | 'checkbox'
  | 'date'
  | 'email'
  | 'number'
  | 'tel'
  | 'text'
  | 'textarea'

export type LoaderType = string | ReactNode

export const BMObject = PropTypes.objectOf(PropTypes.string)
export type BaseMetadataObject = {
  [key: string]: string | undefined | null
}

export type TimeFormat = 'days' | 'hours'

export type BaseComponent = InferProps<typeof BC>

export interface BaseAction<A = string, P = Record<string, any>> {
  type: A
  payload: P
}

export interface BaseState {
  [key: string]: any
  errors?: BaseError[]
}

export type BaseActionType<T = string> = T[]

export interface BFSetStateContainer<T> {
  <P extends T>(param: P): void
}

export interface BaseReducer {
  <S extends BaseState, A extends BaseAction, T extends BaseActionType>(
    state: S,
    action: A,
    type: T
  ): S
}

export interface BaseUnsetState<A> {
  (dispatch: Dispatch<A>): void
}

export interface BaseMetadata {
  [key: string]: string | undefined | null
}

export type BaseFormatPrice = 'formatted' | 'cents' | 'float'

export const baseOrderPricePropTypes = {
  base: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  children: PropTypes.func,
  format: PropTypes.oneOf<BaseFormatPrice>(['formatted', 'cents', 'float']),
  ...BC,
}

export const baseOrderComponentPricePropTypes = {
  children: baseOrderPricePropTypes['children'],
  format: baseOrderPricePropTypes['format'],
  ...BC,
}

export type BasePriceType = 'total' | 'option' | 'unit'
export type BaseSelectorType = 'select' | 'radio'

export type BaseAmountComponentChildren = Omit<BaseAmountComponent, 'children'>

export type BaseAmountComponent = {
  children?: (props: BaseAmountComponentChildren) => ReactNode
  format?: BaseFormatPrice
  price?: string
  priceCents?: number
  labelFree?: string
} & JSX.IntrinsicElements['span']

export interface FunctionChildren<P = Record<string, any>> {
  (props: P): ReactNode
}

export type ExcludeTag<T extends keyof JSX.IntrinsicElements> = Exclude<
  keyof JSX.IntrinsicElements,
  T
>

export type ExtractTag<T extends keyof JSX.IntrinsicElements> = Extract<
  keyof JSX.IntrinsicElements,
  T
>

export type ConditionalElement<E> =
  | ({
      attribute: Extract<keyof E, 'image_url'>
      tagElement: ExtractTag<'img'>
    } & JSX.IntrinsicElements['img'])
  | ({
      attribute: Exclude<keyof E, 'image_url'>
      tagElement: ExcludeTag<'img'>
    } & JSX.IntrinsicElements[ExcludeTag<'img'>])
