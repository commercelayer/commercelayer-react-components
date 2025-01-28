import type { BaseError } from '#typings/errors'
import { pick } from './pick'

export default function customMessages(
  messages: BaseError[] = [],
  v: BaseError
): null | BaseError | undefined {
  const objFiltered = pick(v, ['field', 'code', 'resource', 'detail'])
  const [msg] = messages.filter((item) => {
    switch (true) {
      case item.field === objFiltered.field &&
        item.code === objFiltered.code &&
        item.resource === objFiltered.resource:
        return true
      case item.field != null &&
        objFiltered.detail?.includes(item.field) &&
        item.code === objFiltered.code &&
        item.resource === objFiltered.resource:
        return true
      case item.code === objFiltered.code &&
        item.resource === objFiltered.resource &&
        objFiltered.field == null &&
        item.field == null:
        return true
      default:
        return false
    }
  })
  return msg != null ? msg : null
}
