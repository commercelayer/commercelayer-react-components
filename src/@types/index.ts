import { Dispatch } from 'react'
import { BaseError } from '../components/Errors'
import PropTypes, { InferProps } from 'prop-types'

export const BC = {
  id: PropTypes.string,
  key: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
}

export const BMObject = PropTypes.objectOf(PropTypes.string)
export type BaseMetadataObject = InferProps<typeof BMObject>

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

export interface BaseReducer {
  <S extends BaseState, A extends BaseAction, T extends BaseActionType>(
    state: S,
    action: A,
    type?: T
  ): S
}

export interface BaseUnsetState<A> {
  (dispatch: Dispatch<A>): void
}

export interface BaseMetadata {
  [key: string]: string
}
