import { first } from 'lodash'
import { BaseError } from '#typings/errors'

export interface CustomMessages {
  (messages: BaseError[], v: BaseError): { message?: string } | undefined
}

const customMessages: CustomMessages = (messages = [], v) => {
  return first(
    messages.filter((m) => {
      if (m.field === v.field) {
        return m.code === v.code
      }
      if (m.resource === v.resource) {
        return m.code === v.code
      }
      return m.code === v.code
    })
  )
}

export default customMessages
