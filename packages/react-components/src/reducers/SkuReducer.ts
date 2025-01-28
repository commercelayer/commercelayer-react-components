import type { QueryParamsList, Sku } from '@commercelayer/sdk'
import type { Dispatch } from 'react'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { BaseAction } from '#typings'
import baseReducer from '#utils/baseReducer'
import getSdk from '#utils/getSdk'

type SkuActionType = 'getSkus' | 'setLoading'
type SkuAction = BaseAction<SkuActionType, SkuState>
export type SkuState = Partial<{
  skus: Sku[]
  loading: boolean
  skuCodes: string[]
}>

const actionType: SkuActionType[] = ['getSkus']

export const skuInitialState: SkuState = {
  skus: [],
  loading: true,
  skuCodes: []
}

interface GetSku {
  config: CommerceLayerConfig
  skus: string[]
  dispatch: Dispatch<SkuAction>
  queryParams?: QueryParamsList
}

export async function getSku<T extends GetSku>({
  config,
  skus,
  dispatch,
  queryParams
}: T): Promise<void> {
  if (!config.accessToken) return
  if (skus.length === 0) return
  const sdk = getSdk(config)
  let allSkus: Sku[] = []
  const get = await sdk.skus.list({
    ...queryParams,
    filters: { ...queryParams?.filters, code_in: skus.join(',') }
  })
  allSkus = [...get]
  const meta = get.meta
  if (meta.pageCount > 1) {
    for (
      let pageNumber = meta.currentPage + 1;
      pageNumber <= meta.pageCount;
      pageNumber++
    ) {
      const getPage = await sdk.skus.list({
        ...queryParams,
        filters: { ...queryParams?.filters, code_in: skus.join(',') },
        pageNumber
      })
      allSkus = [...allSkus, ...getPage]
    }
  }
  dispatch({
    type: 'getSkus',
    payload: {
      skus: allSkus,
      loading: false,
      skuCodes: skus
    }
  })
}

export default function skuReducer(
  state: SkuState,
  reducer: SkuAction
): SkuState {
  return baseReducer<SkuState, SkuAction, SkuActionType[]>(
    state,
    reducer,
    actionType
  )
}
