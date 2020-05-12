import { Dispatch, ReactNode } from 'react'
import PropTypes, { InferProps, ReactElementLike } from 'prop-types'
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

export interface SelectPlaceholder {
  label: string
  value: string | number
}

type BaseSelectChildrenComponentProps = Omit<
  BaseSelectComponentProps,
  'children'
>

export interface BaseSelectComponentProps {
  children?: (props: BaseSelectChildrenComponentProps) => ReactNode
  options: {
    label: string
    value: string | number
    selected?: boolean
  }[]
  placeholder?: SelectPlaceholder
  value?: string
  name: string
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
}

export interface BaseInputComponentProps {
  children?: (props: BaseInputChildrenComponentProps) => ReactNode
  name: string
  type: BaseInputType
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  placeholder?: string
}

export type LineItemType =
  | 'skus'
  | 'gift_cards'
  | 'shipments'
  | 'paymentMethods'
  | 'promotions'

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

export type BaseInputType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'textarea'

export type LoaderType = string | ReactElementLike

export const BMObject = PropTypes.objectOf(PropTypes.string)
export type BaseMetadataObject = {
  [key: string]: string | undefined | null
}

export type TimeFormat = 'days' | 'hours'

export type BaseComponent = InferProps<typeof BC>

export interface BaseAction<A = string> {
  type: A
  payload: object
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

export interface BaseAmountComponent
  extends Partial<JSX.IntrinsicElements['span']> {
  children?: (props: BaseAmountComponentChildren) => ReactNode
  format?: BaseFormatPrice
}

export interface FunctionChildren<P = {}> {
  (props: P): ReactNode
}
