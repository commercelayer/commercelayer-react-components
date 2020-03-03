import { Dispatch } from 'react'
import baseReducer from '../utils/baseReducer'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import CLayer, { SkuOptionCollection } from '@commercelayer/js-sdk'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { BaseError } from '../components/Errors'
import { BaseUnsetState } from '../@types/index'

export interface SkuOptionsState {
  skuCode?: string
  skuOptions?: SkuOptionCollection[]
  errors?: BaseError[]
}

interface GetSkuOptionsParams {
  skuCode: string
  dispatch: Dispatch<SkuOptionsAction>
  config: CommerceLayerConfig
}

export interface GetSkuOptions {
  (params: GetSkuOptionsParams): void
}

export const getSkuOptions: GetSkuOptions = async params => {
  const { skuCode, dispatch, config } = params
  try {
    const sku = await CLayer.Sku.withCredentials(config)
      .includes('skuOptions')
      .findBy({ code: skuCode })
    const skuOptions = sku.skuOptions().toArray()
    dispatch({
      type: 'setSkuOptions',
      payload: {
        skuOptions
      }
    })
  } catch (c) {
    const errors = getErrorsByCollection(c, 'skuOption')
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

export const unsetSkuOptionsState: BaseUnsetState<SkuOptionsAction> = dispatch => {
  dispatch({
    type: 'setSkuOptions',
    payload: {
      skuOptions: []
    }
  })
  dispatch({
    type: 'setErrors',
    payload: {
      errors: []
    }
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
  skuOptions: []
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
