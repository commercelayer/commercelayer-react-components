import { BaseUnsetState } from '@typings/index'
import { SkuCollection, PriceCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import baseReducer from '@utils/baseReducer'

export interface Items {
  [skuCode: string]: SkuCollection
}

export interface ItemPrices {
  [skuCode: string]: PriceCollection
}

export interface ItemQuantity {
  [skuCode: string]: number
}

export interface ItemOption {
  [key: string]: {
    skuOptionId: string
    options: {
      [key: string]: string
    }
  }
}

export interface ItemOptions {
  [skuCode: string]: ItemOption
}

export type CustomLineItem = {
  name?: string
  imageUrl?: string | null
}

export interface CustomLineItems {
  [skuCode: string]: CustomLineItem
}

type ItemParams = {
  type: ItemActionType
  key:
    | 'items'
    | 'item'
    | 'quantity'
    | 'option'
    | 'prices'
    | 'lineItem'
    | 'lineItems'
    | 'skuCode'
}

type DataType =
  | Items
  | ItemQuantity
  | ItemOptions
  | ItemPrices
  | CustomLineItems
  | CustomLineItem
  | string

export interface SetItemState {
  (data: DataType, params: ItemParams, dispatch: Dispatch<ItemAction>): void
}

// TODO: Set to other reducer files
export const setItemState: SetItemState = (data, params, dispatch) => {
  dispatch({
    type: params.type,
    payload: {
      [`${params.key}`]: data,
    },
  })
}

export const unsetItemState: BaseUnsetState<ItemAction> = (dispatch) => {
  dispatch({
    type: 'setItem',
    payload: {
      item: {},
    },
  })
  dispatch({
    type: 'setItems',
    payload: {
      items: {},
    },
  })
  dispatch({
    type: 'setQuantity',
    payload: {
      quantity: {},
    },
  })
  dispatch({
    type: 'setOption',
    payload: {
      option: {},
    },
  })
  dispatch({
    type: 'setCustomLineItems',
    payload: {
      lineItems: {},
    },
  })
  dispatch({
    type: 'setCustomLineItem',
    payload: {
      lineItem: {},
    },
  })
}

export type SetCustomLineItems = (lineItems: CustomLineItems) => void
export type SetCustomLineItem = (lineItem: CustomLineItem) => void

export interface ItemState {
  skuCode?: string
  items?: Items
  item?: Items
  lineItems?: CustomLineItems
  lineItem?: CustomLineItem
  quantity?: ItemQuantity
  option?: ItemOptions
  prices?: ItemPrices
  setItems?: (items: Items) => void
  setItem?: (item: Items) => void
  setQuantity?: (quantity: ItemQuantity) => void
  setOption?: (option: ItemOptions) => void
  setPrices?: (prices: ItemPrices) => void
  setSkuCode?: (skuCode: string) => void
  setCustomLineItems: SetCustomLineItems
  setCustomLineItem?: SetCustomLineItem
}

type ItemActionType =
  | 'setItem'
  | 'setItems'
  | 'setQuantity'
  | 'setOption'
  | 'setPrices'
  | 'setCustomLineItems'
  | 'setCustomLineItem'
  | 'setSkuCode'

const actionType: ItemActionType[] = [
  'setItem',
  'setItems',
  'setQuantity',
  'setOption',
  'setPrices',
  'setCustomLineItems',
  'setCustomLineItem',
  'setSkuCode',
]

export interface ItemAction {
  type: ItemActionType
  payload: Partial<ItemState>
}

export const itemInitialState: Partial<ItemState> = {
  items: {},
  item: {},
  quantity: {},
  option: {},
  prices: {},
  lineItems: {},
  lineItem: {},
  skuCode: '',
}

const itemReducer = (
  state: Partial<ItemState>,
  reducer: ItemAction
): Partial<ItemState> =>
  baseReducer<Partial<ItemState>, ItemAction, ItemActionType[]>(
    state,
    reducer,
    actionType
  )

export default itemReducer
