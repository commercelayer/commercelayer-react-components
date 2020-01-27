import { CSSProperties } from 'react'

export interface GeneralComponent {
  className?: string
  style?: CSSProperties
}

export interface GeneralActions {
  type: string
  payload: any
}

export interface GeneralReducer<S, A> {
  (state: S, action: A): S
}
