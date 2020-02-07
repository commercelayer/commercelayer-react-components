import { Items } from '../reducers/OrderReducer'
import _ from 'lodash'

export interface GetCurrentItemKey {
  (item: Items): string
}

const getCurrentItemKey: GetCurrentItemKey = item => {
  return _.first(_.keys(item))
}

export default getCurrentItemKey
