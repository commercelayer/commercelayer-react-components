import { Dispatch } from 'react'
import { BaseError } from '../components/Errors'
import PropTypes, { InferProps, ReactElementLike } from 'prop-types'

export const BC = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
}

export const PTLoader = PropTypes.oneOfType([
  PropTypes.element,
  PropTypes.string
])

export const BaseOrderPricePropsTypes = {
  base: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  children: PropTypes.func,
  format: PropTypes.oneOf(['formatted', 'cents', 'float'])
}

export const BaseOrderComponentPropTypes = {
  children: BaseOrderPricePropsTypes['children'],
  format: BaseOrderPricePropsTypes['format']
}

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
  [key: string]: string
}

export type InferPropTypes<
  PropTypes,
  DefaultProps = {},
  Props = InferProps<PropTypes>
> = {
  [Key in keyof Props]: Key extends keyof DefaultProps
    ? Props[Key] | DefaultProps[Key]
    : Props[Key]
}
