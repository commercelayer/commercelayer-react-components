import { CSSProperties, Dispatch } from 'react'
import { BaseError } from '../components/Errors'

export interface BaseComponent {
  id?: string
  key?: string
  className?: string
  style?: CSSProperties
}

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
