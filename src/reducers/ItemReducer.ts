import {
  GeneralReducer,
  GeneralActions,
  GeneralUnsetState
} from '../@types/index'
import { SkuCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'

export interface Items {
  [skuCode: string]: SkuCollection
}

export interface SetItems {
  (object: Items, dispatch: Dispatch<ItemActions>)
}

export const setItems: SetItems = (items, dispatch) => {
  dispatch({
    type: 'setItems',
    payload: {
      items
    }
  })
}

export const setItem: SetItems = (item, dispatch) => {
  dispatch({
    type: 'setItem',
    payload: {
      item
    }
  })
}

export const unsetItemState: GeneralUnsetState<ItemActions> = dispatch => {
  dispatch({
    type: 'setItem',
    payload: {
      item: null
    }
  })
  dispatch({
    type: 'setItems',
    payload: {
      items: null
    }
  })
  dispatch({
    type: 'setQuantity',
    payload: {
      quantity: 1
    }
  })
}

export interface ItemState {
  items?: Items
  item?: Items
  quantity?: number
  setItems?: (items: Items) => SetItems
  setItem?: (items: Items) => SetItems
  setQuantity?: any
}

type ItemActionType = 'setItem' | 'setItems' | 'setQuantity'

export interface ItemActions extends GeneralActions {
  type: ItemActionType
  payload: ItemState
}

export const itemInitialState: ItemState = {
  items: {},
  item: {},
  quantity: 1
}

const itemReducer: GeneralReducer<ItemState, ItemActions> = (state, action) => {
  const actions: ItemActionType[] = ['setItem', 'setItems', 'setQuantity']
  if (actions.indexOf(action.type) !== -1) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default itemReducer
