import { CSSProperties } from 'react'

export interface GeneralComponent {
  id?: string
  key?: string
  className?: string
  style?: CSSProperties
}

export interface GeneralActions {
  type: string
  payload: object
}

export interface GeneralReducer<S, A> {
  (state: S, action: A): S
}
