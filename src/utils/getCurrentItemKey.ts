import { first, keys } from 'lodash'
import { Items } from '#reducers/ItemReducer'

export interface GetCurrentItemKey {
  (item: Items): string
}

const getCurrentItemKey: GetCurrentItemKey = (item) => {
  return first(keys(item)) || ''
}

export default getCurrentItemKey
