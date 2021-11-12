import { Dispatch } from 'react'
import baseReducer from '#utils/baseReducer'
import { SkuOption } from '@commercelayer/sdk'
import { BaseUnsetState } from '#typings/index'
import { BaseError } from '#typings/errors'

export interface SkuOptionsState {
  skuCode?: string
  skuOptions?: SkuOption[]
  errors?: BaseError[]
}

interface GetSkuOptionsParams {
  dispatch: Dispatch<SkuOptionsAction>
  skuOptions?: SkuOption[]
}

export interface GetSkuOptions {
  (params: GetSkuOptionsParams): void
}

export const getSkuOptions: GetSkuOptions = async (params) => {
  const { skuOptions, dispatch } = params
  dispatch({
    type: 'setSkuOptions',
    payload: {
      skuOptions,
    },
  })
}

export const unsetSkuOptionsState: BaseUnsetState<SkuOptionsAction> = (
  dispatch
) => {
  dispatch({
    type: 'setSkuOptions',
    payload: {
      skuOptions: [],
    },
  })
  dispatch({
    type: 'setErrors',
    payload: {
      errors: [],
    },
  })
}

export type SkuOptionsActionType = 'setSkuOptions' | 'setErrors'

const actionType: SkuOptionsActionType[] = ['setSkuOptions', 'setErrors']

export interface SkuOptionsAction {
  type: SkuOptionsActionType
  payload: SkuOptionsState
}

export const skuOptionsInitialState: SkuOptionsState = {
  skuCode: '',
  skuOptions: [],
}

const skuOptionsReducer = (
  state: SkuOptionsState,
  reducer: SkuOptionsAction
): SkuOptionsState =>
  baseReducer<SkuOptionsState, SkuOptionsAction, SkuOptionsActionType[]>(
    state,
    reducer,
    actionType
  )

export default skuOptionsReducer
