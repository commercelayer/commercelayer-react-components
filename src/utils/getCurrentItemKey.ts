import _ from 'lodash'
import { Items } from '../reducers/ItemReducer'

export interface GetCurrentItemKey {
  (item: Items): string
}

const getCurrentItemKey: GetCurrentItemKey = item => {
  return _.first(_.keys(item))
}

export default getCurrentItemKey
