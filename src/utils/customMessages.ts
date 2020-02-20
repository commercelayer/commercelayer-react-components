import { BaseError } from '../components/Errors'
import _ from 'lodash'

export interface CustomMessages {
  (messages: BaseError[], v: BaseError): { message?: string }
}

const customMessages: CustomMessages = (messages = [], v) => {
  return _.first(
    messages.filter(m => {
      if (m.field === v.field) {
        return m.code === v.code
      }
      if (m.base === v.base) {
        return m.code === v.code
      }
      return m.code === v.code
    })
  )
}

export default customMessages
