import findIndex from 'lodash/findIndex'
import pick from 'lodash/pick'
import { BaseError } from '#typings/errors'

export default function customMessages(
  messages: BaseError[] = [],
  v: BaseError
): null | BaseError | undefined {
  const i = findIndex(messages, pick(v, ['field', 'code', 'resource']))
  return i !== -1 ? messages[i] : null
}
