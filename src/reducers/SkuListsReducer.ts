import baseReducer from '../utils/baseReducer'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { SkuList } from '@commercelayer/js-sdk'

type SkuListsActionType = 'getSkuList' | 'setSkuList'

const actionType: SkuListsActionType[] = ['getSkuList', 'setSkuList']

export interface SkuListsState {
  listIds: string[]
  skuLists: SkuList
}

export const skuListsInitialState: SkuListsState = {
  listIds: [],
  skuLists: {},
}

export interface SkuListsAction {
  payload: Partial<SkuListsState>
  type: SkuListsActionType
}

export type GetSkuList = (params: {
  config: CommerceLayerConfig
  dispatch: Dispatch<SkuListsAction>
  listIds: string[]
  state: SkuListsState
}) => Promise<void>

export type SkuList = Record<string, string[]>

export const getSkuList: GetSkuList = async ({
  listIds,
  config,
  dispatch,
  // state,
}) => {
  const skuLists: SkuList = {}
  try {
    listIds.map(async (id) => {
      const skuList = await SkuList.withCredentials(config)
        .includes('skus')
        .select({ skus: ['code'] })
        .find(id)
      const skuCodes = skuList
        .skus()
        .toArray()
        .map((sku) => sku.code)
      skuLists[id] = skuCodes
    })
    dispatch({
      payload: {
        skuLists,
      },
      type: 'getSkuList',
    })
  } catch (error) {
    console.error(error)
    return error
  }
}

const skuListsReducer = (
  state: SkuListsState,
  reducer: SkuListsAction
): SkuListsState =>
  baseReducer<SkuListsState, SkuListsAction, SkuListsActionType[]>(
    state,
    reducer,
    actionType
  )

export default skuListsReducer
