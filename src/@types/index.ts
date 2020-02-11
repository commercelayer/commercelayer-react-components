import { CSSProperties, Dispatch } from 'react'

export interface BaseComponent {
  id?: string
  key?: string
  className?: string
  style?: CSSProperties
}

export interface BaseAction {
  type: string
  payload: object
}

export interface BaseReducer<S, A> {
  (state: S, action: A): S
}

export interface BaseUnsetState<A> {
  (dispatch: Dispatch<A>): void
}
