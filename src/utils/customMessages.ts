import findIndex from 'lodash/findIndex'
import pick from 'lodash/pick'
import { BaseError } from '#typings/errors'

export interface CustomMessages {
  (messages: BaseError[], v: BaseError): { message?: string } | null
}

const customMessages: CustomMessages = (messages = [], v) => {
  const i = findIndex(messages, pick(v, ['field', 'code', 'resource']))
  return i !== -1 ? messages[i] : null
}

export default customMessages
