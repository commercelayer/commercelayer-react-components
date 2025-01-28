import baseReducer from '#utils/baseReducer'
import type { Dispatch } from 'react'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import getSdk from '#utils/getSdk'

type SkuListsActionType = 'getSkuList' | 'setSkuList'

const actionType: SkuListsActionType[] = ['getSkuList', 'setSkuList']

export type SkuListsState = Partial<{
  listIds: string[]
  skuLists: Record<string, any>
}>

export const skuListsInitialState: SkuListsState = {
  listIds: []
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

export const getSkuList: GetSkuList = async ({ listIds, config, dispatch }) => {
  const skuLists: Record<string, any> = {}
  try {
    const sdk = getSdk(config)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    listIds.forEach(async (id) => {
      const skuList = await sdk.sku_lists.retrieve(id, {
        include: ['skus'],
        fields: { skus: ['code'] }
      })
      const skuCodes = skuList.skus
      skuLists[id] = skuCodes
    })
    dispatch({
      payload: {
        skuLists
      },
      type: 'getSkuList'
    })
  } catch (error: any) {
    console.error(error)
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
